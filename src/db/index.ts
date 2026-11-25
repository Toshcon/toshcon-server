import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseConnectionUrl } from "./connection.js";
import * as schema from "./schema/index.js";

// node-postgres uses unnamed queries by default, which work with
// Supabase's transaction pooler. Avoid named .prepare() queries here.
export const pool = new Pool({
  connectionString: databaseConnectionUrl,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL connection error:", error.message);
});

export const db = drizzle(pool, { schema });

export async function closeDb(): Promise<void> {
  await pool.end();
}
