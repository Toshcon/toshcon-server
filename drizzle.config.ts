import { defineConfig } from "drizzle-kit";
import { databaseConnectionUrl } from "./src/db/connection.js";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: { url: databaseConnectionUrl },
});
