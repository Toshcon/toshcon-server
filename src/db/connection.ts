import { resolve } from "node:path";
import { env } from "../env.js";

const url = new URL(env.DATABASE_URL);

// URL options are shared by the runtime and Drizzle Kit's pg driver.
if (!url.searchParams.has("sslmode")) {
  url.searchParams.set("sslmode", "verify-full");
}

const isSupabase =
  url.hostname.endsWith(".pooler.supabase.com") ||
  url.hostname.endsWith(".supabase.co");

if (isSupabase && !url.searchParams.has("sslrootcert")) {
  url.searchParams.set("sslrootcert", resolve("certs/supabase-ca.crt"));
}

export const databaseConnectionUrl = url.toString();
