import test from "node:test";
import assert from "node:assert/strict";
import { normalizePublicationPayload } from "../src/utils/publication.utils.js";
import {
  createCategorySchema,
  publicationQuerySchema,
  updateProfileSchema,
} from "../src/validators/schemas.js";

test("conserva las imágenes cuando el cliente no las envía (edición parcial)", () => {
  const payload = normalizePublicationPayload({ title: "Mesa", price: 1000 });
  assert.equal(payload.images, undefined);
});

test("vacía las imágenes cuando el cliente envía una lista vacía", () => {
  const payload = normalizePublicationPayload({ title: "Mesa", price: 1000, images: [] });
  assert.deepEqual(payload.images, []);
});

test("acepta lat, lng y radius en el filtro de publicaciones", () => {
  const result = publicationQuerySchema.safeParse({ lat: "4.6", lng: "-74.1", radius: "3" });
  assert.equal(result.success, true);
  assert.equal(result.data.radius, 3);
  assert.equal(result.data.lat, 4.6);
});

test("rechaza radios fuera de la lista soportada", () => {
  assert.equal(publicationQuerySchema.safeParse({ radius: "7" }).success, false);
});

test("permite crear categorías sin slug (lo genera el servicio)", () => {
  assert.equal(createCategorySchema.safeParse({ name: "Hogar" }).success, true);
});

test("actualizar perfil acepta snake_case y camelCase", () => {
  const snake = updateProfileSchema.safeParse({ neighborhood_id: "0f8fad5b-d9cb-469f-a165-70867728950e" });
  const camel = updateProfileSchema.safeParse({ neighborhoodId: "0f8fad5b-d9cb-469f-a165-70867728950e" });
  assert.equal(snake.success, true);
  assert.equal(camel.success, true);
  assert.equal(updateProfileSchema.safeParse({}).success, false);
});
