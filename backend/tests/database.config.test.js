import test from "node:test";
import assert from "node:assert/strict";
import { getDatabaseConfig } from "../src/config/database.js";

test("getDatabaseConfig uses docker-friendly defaults when no env is provided", () => {
  const config = getDatabaseConfig({});

  assert.equal(config.host, "localhost");
  assert.equal(config.port, 5432);
  assert.equal(config.database, "muiska");
  assert.equal(config.user, "postgres");
  assert.equal(config.password, "postgres");
});

test("getDatabaseConfig prefers explicit environment values", () => {
  const config = getDatabaseConfig({
    DB_HOST: "postgres",
    DB_PORT: "5433",
    DB_NAME: "custom_db",
    DB_USER: "custom_user",
    DB_PASSWORD: "custom_password",
  });

  assert.equal(config.host, "postgres");
  assert.equal(config.port, 5433);
  assert.equal(config.database, "custom_db");
  assert.equal(config.user, "custom_user");
  assert.equal(config.password, "custom_password");
});
