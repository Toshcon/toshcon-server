# Server conventions

Follow this structure for future changes:

- Keep all Zod validation schemas in `src/validations/`, grouped by concern in
  `<concern>.schema.ts` files, and export them through `src/validations/index.ts`.
  Import shared schemas rather than duplicating validation rules in consumers.
- Define environment validation in `src/validations/env.schema.ts`. Keep schemas
  free of environment loading, database connections, and other startup effects.
- Load `.env` and validate it only in `src/env.ts`. All other application code
  and tooling must import the validated `env` export instead of reading
  `process.env` or loading `dotenv` directly. Add new environment variables to
  the shared schema and `.env.example`; never log secret values.
- Keep Drizzle table definitions in `src/db/schema/`, database connection setup
  in `src/db/index.ts`, migrations in `src/db/migrations/`, and seeds in
  `src/db/seed/`. Drizzle table schemas are separate from Zod validation schemas.
  Export tables and enums through `src/db/schema/index.ts`. Share timestamps
  through `columns.ts` and PostgreSQL enums through `enums.ts`. Keep product
  prices, documents, and media in their separate tables. Do not add RLS or SQL
  check constraints unless explicitly requested.
- Product types belong to one product category. Products store both
  `productCategoryId` and `productTypeId`; retain the composite foreign key that
  ensures the type belongs to the selected category.
- Use the shared `userTypeEnum` (`normal`, `dealer`, `oem`, `epc`, `other`)
  directly in users and product pricing. `other_user_types` is a user-only
  lookup via nullable `users.otherUserTypeId`; product prices must not reference
  it or have an extra other-type column.
- Keep feature routes and controllers in `src/api/v1/modules/<feature>/`,
  middleware in `src/middlewares/`, and shared utilities in `src/utils/`.
- Use `.js` extensions in local TypeScript imports for the existing NodeNext ESM
  configuration. Preserve this structure when adding features.
