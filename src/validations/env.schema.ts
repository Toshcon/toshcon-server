import { z } from "zod";

export const envSchema = z.object({
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
