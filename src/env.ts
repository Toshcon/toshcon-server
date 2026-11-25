import "dotenv/config";
import { envSchema, type Env } from "./validations/index.js";

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const errors = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  // Report field names and validation messages without exposing secret values.
  throw new Error(`Invalid environment variables. Check server/.env:\n${errors}`);
}

export type { Env } from "./validations/index.js";
export const env: Readonly<Env> = Object.freeze(result.data);
