import test from "node:test";
import assert from "node:assert/strict";
import { requireRole } from "../src/middlewares/auth.middleware.js";

// Ejecuta el middleware con un req.user simulado y devuelve el error (o null).
const run = (middleware, user) =>
  new Promise((resolve) => {
    middleware({ user }, {}, (err) => resolve(err || null));
  });

test("permite a admin y verifier cuando se pasan roles variádicos", async () => {
  assert.equal(await run(requireRole("verifier", "admin"), { role: "admin" }), null);
  assert.equal(await run(requireRole("verifier", "admin"), { role: "verifier" }), null);
});

test("acepta un arreglo de roles", async () => {
  assert.equal(await run(requireRole(["verifier", "admin"]), { role: "admin" }), null);
});

test("rechaza a un usuario normal con 403", async () => {
  const err = await run(requireRole("verifier", "admin"), { role: "user" });
  assert.ok(err);
  assert.equal(err.statusCode, 403);
  assert.equal(err.code, "FORBIDDEN");
});

test("rechaza cuando no hay usuario autenticado", async () => {
  const err = await run(requireRole("admin"), null);
  assert.ok(err);
  assert.equal(err.statusCode, 403);
});
