import test from "node:test";
import assert from "node:assert/strict";
import { normalizePublicationPayload } from "../src/utils/publication.utils.js";

test("normaliza payload de publicación con imágenes y campos adicionales", () => {
  const payload = normalizePublicationPayload({
    title: "  Mesa de trabajo  ",
    description: "  Excelente estado  ",
    price: "120000",
    category: "  Tecnología  ",
    location: "  Bogotá  ",
    contactMethod: "  WhatsApp  ",
    images: ["img1.png", "img2.png"],
  });

  assert.equal(payload.title, "Mesa de trabajo");
  assert.equal(payload.description, "Excelente estado");
  assert.equal(payload.price, 120000);
  assert.equal(payload.category, "Tecnología");
  assert.equal(payload.location, "Bogotá");
  assert.equal(payload.contact_method, "WhatsApp");
  assert.deepEqual(payload.images, ["img1.png", "img2.png"]);
});
