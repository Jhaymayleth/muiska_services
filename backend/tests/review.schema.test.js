import test from "node:test";
import assert from "node:assert/strict";
import { createReviewSchema } from "../src/validators/schemas.js";

test("acepta una reseña válida y normaliza el rating", () => {
  const result = createReviewSchema.safeParse({ rating: "4", comment: "  Muy bien  " });
  assert.equal(result.success, true);
  assert.equal(result.data.rating, 4);
  assert.equal(result.data.comment, "Muy bien");
});

test("rechaza ratings fuera del rango 1..5 o no enteros", () => {
  assert.equal(createReviewSchema.safeParse({ rating: 0 }).success, false);
  assert.equal(createReviewSchema.safeParse({ rating: 6 }).success, false);
  assert.equal(createReviewSchema.safeParse({ rating: 2.5 }).success, false);
  assert.equal(createReviewSchema.safeParse({}).success, false);
});

test("acepta comentario nulo u omitido", () => {
  assert.equal(createReviewSchema.safeParse({ rating: 5, comment: null }).success, true);
  assert.equal(createReviewSchema.safeParse({ rating: 5 }).success, true);
});

test("rechaza comentarios de más de 1000 caracteres", () => {
  assert.equal(
    createReviewSchema.safeParse({ rating: 5, comment: "x".repeat(1001) }).success,
    false,
  );
});
