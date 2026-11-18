import { execFileSync } from "node:child_process";

const API = process.env.API_URL || "http://localhost:3001/api";

const request = async (method, path, { body, token, raw } = {}) => {
  const response = await fetch(API + path, {
    method,
    headers: {
      ...(body && !raw ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? (raw ? body : JSON.stringify(body)) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
};

const sql = (query) =>
  execFileSync("docker", ["exec", "muiska-postgres", "psql", "-U", "postgres", "-d", "muiska", "-tAc", query])
    .toString()
    .trim();

const assert = (condition, message) => {
  if (!condition) throw new Error(`FALLO: ${message}`);
  console.log(`ok - ${message}`);
};

const stamp = Date.now();
const register = (email, userType = "client") =>
  request("POST", "/auth/register", {
    body: { name: `E2E ${stamp}`, email, password: "Password123", userType },
  });

// Vendedor aprobado (la aprobación se hace por SQL: el flujo de verificación
// tiene su propio panel y aquí solo se necesita el estado final).
const sellerEmail = `seller-${stamp}@test.local`;
assert((await register(sellerEmail, "seller")).status === 201, "registro de vendedor");
sql(`UPDATE users SET verification_status = 'approved', is_verified_badge = TRUE WHERE email = '${sellerEmail}'`);
const seller = (await request("POST", "/auth/login", { body: { email: sellerEmail, password: "Password123" } })).data;
assert(seller.user.user_type === "seller", "login devuelve user_type");
const sellerToken = seller.token;

const categories = (await request("GET", "/categories")).data;
const categorySlug = categories[0].slug;

const created = await request("POST", "/publications", {
  token: sellerToken,
  body: {
    title: "Bicicleta E2E",
    description: "Prueba de auditoría",
    price: 250000,
    category: categorySlug,
    location: "Bogotá",
    contactMethod: "WhatsApp",
    images: ["/uploads/e2e-1.jpg"],
  },
});
assert(created.status === 201, "crear publicación");
assert(created.data.category_id && created.data.category, "la categoría se resuelve por slug");
const publicationId = created.data.id;

const sellerMe = (await request("GET", "/auth/me", { token: sellerToken })).data;
assert(sellerMe.id === seller.user.id, "perfil del vendedor");

// Verificador
const verifierEmail = `verifier-${stamp}@test.local`;
await register(verifierEmail);
sql(`UPDATE users SET role = 'verifier' WHERE email = '${verifierEmail}'`);
const verifierToken = (
  await request("POST", "/auth/login", { body: { email: verifierEmail, password: "Password123" } })
).data.token;

const approved = await request("POST", `/moderation/${publicationId}/approve`, { token: verifierToken });
assert(approved.status === 200, "aprobar publicación");
const twice = await request("POST", `/moderation/${publicationId}/approve`, { token: verifierToken });
assert(twice.status === 409, "aprobar dos veces devuelve 409");

const beforeAnon = await request("GET", `/publications/${publicationId}`);
assert(beforeAnon.status === 200, "el detalle aprobado es público");

const edited = await request("PUT", `/publications/${publicationId}`, {
  token: sellerToken,
  body: { title: "Bicicleta E2E editada" },
});
assert(edited.status === 200, "editar publicación");
assert(Array.isArray(edited.data.images) && edited.data.images.length === 1, "la edición conserva las imágenes");
assert(edited.data.moderation_status === "pending", "editar una aprobada la devuelve a moderación");

const afterAnon = await request("GET", `/publications/${publicationId}`);
assert(afterAnon.status === 404, "el detalle pendiente no es público");
const afterOwner = await request("GET", `/publications/${publicationId}`, { token: sellerToken });
assert(afterOwner.status === 200, "el dueño ve su publicación pendiente");

const byLocation = await request("GET", `/publications?location=Bogota`);
assert(byLocation.status === 200, "filtro por barrio sin unaccent fallando");

// Perfil: coordenadas y actualización parcial
assert(
  (await request("PUT", "/auth/me", { token: sellerToken, body: { lat: 4.65, lng: -74.05, phone: "3001112233" } }))
    .status === 200,
  "guardar coordenadas y teléfono",
);
const partial = await request("PUT", "/auth/me", { token: sellerToken, body: { name: "Nombre Parcial" } });
assert(partial.status === 200 && partial.data.phone === "3001112233", "actualizar nombre no borra el teléfono");

const geo = await request("GET", `/publications?lat=4.65&lng=-74.05&radius=3`);
assert(geo.status === 200, "filtro por radio responde 200");
assert(Array.isArray(geo.data.data), "el filtro por radio devuelve resultados paginados");

// Admin sin slug
const adminEmail = `admin-${stamp}@test.local`;
await register(adminEmail);
sql(`UPDATE users SET role = 'admin' WHERE email = '${adminEmail}'`);
const adminToken = (
  await request("POST", "/auth/login", { body: { email: adminEmail, password: "Password123" } })
).data.token;
const category = await request("POST", "/categories", { token: adminToken, body: { name: `Prueba E2E ${stamp}` } });
assert(category.status === 201 && !!category.data.slug, "crear categoría sin slug");
const updatedCategory = await request("PUT", `/categories/${category.data.id}`, {
  token: adminToken,
  body: { description: "Solo descripción" },
});
assert(updatedCategory.status === 200, "actualizar categoría solo con descripción");

// Borrado: el controlador pasaba los parámetros invertidos y siempre daba 404.
const disposable = await request("POST", "/publications", {
  token: sellerToken,
  body: { title: "Publicación a borrar", price: 1000, category: categorySlug, images: [] },
});
assert(disposable.status === 201, "crear publicación para borrar");
const removed = await request("DELETE", `/publications/${disposable.data.id}`, { token: sellerToken });
assert(removed.status === 200, "borrar la publicación propia");
const gone = await request("GET", `/publications/${disposable.data.id}`, { token: sellerToken });
assert(gone.status === 404, "la publicación borrada ya no existe");

console.log("\nE2E publicaciones/perfil: OK");
