import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  ADMIN_ORIGIN: z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//.test(value), {
      message: "ADMIN_ORIGIN must use http:// or https://",
    })
    .transform((value) => new URL(value).origin)
    .default("http://localhost:3000"),
  DATABASE_URL: z
    .string({ error: "DATABASE_URL is required" })
    .trim()
    .min(1, "DATABASE_URL is required")
    .url(
      "DATABASE_URL must be a valid URL. URL-encode special characters in its password.",
    )
    .refine(
      (value) => /^postgres(?:ql)?:\/\//.test(value),
      "DATABASE_URL must use postgres:// or postgresql://",
    ),
});

export type Env = z.infer<typeof envSchema>;
