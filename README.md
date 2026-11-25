# Server

TypeScript and Express server using Drizzle ORM with PostgreSQL on Supabase.

## Commands

Run these from `server/`:

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile TypeScript into `dist/`. |
| `npm start` | Run the compiled entry point; build first. |
| `npm run dev` | Run the TypeScript entry point and restart on changes. |
| `npm test` | Run Node's test runner with TypeScript support through `tsx`. |
| `npm run migrate` | Apply pending Drizzle migrations to the configured database. |
| `npm run generate` | Generate SQL migrations from the Drizzle schema. |

The existing `db:migrate` and `db:generate` scripts remain available as aliases.
No tests have been added yet.

## Structure

- `src/api/v1/modules/`: feature routes and controllers.
- `src/middlewares/`: Express middleware.
- `src/utils/`: shared utilities.
- `src/validations/`: shared Zod schemas, grouped in `<concern>.schema.ts` files
  and exported through `index.ts`.
- `src/env.ts`: loads `.env`, validates variables with Zod, and exports typed `env`.
- `src/db/index.ts`: shared database connection and `closeDb()` for shutdown.
- `src/db/connection.ts`: shared connection URL and verified TLS options for
  the runtime and Drizzle Kit.
- `certs/`: public Supabase root CA certificate; include it in deployments.
- `src/db/schema/`: table definitions and inferred TypeScript types.
- `src/db/migrations/`: generated SQL migrations and Drizzle metadata.
- `src/db/seed/`: reserved for seed scripts.

## Database setup

Run commands from `server/`:

1. Install dependencies with `npm install`.
2. Paste your Supabase **Transaction pooler** URI into `DATABASE_URL` in `.env`.
   The URI is available in Supabase Dashboard > Connect and uses port `6543`.
   URL-encode special characters in the password. `.env.example` documents the
   required variable; `.env` is ignored by Git.
3. Generate migrations for the current schema with `npm run generate`, review
   the SQL, then apply them with `npm run migrate`.

The runtime uses a shared `pg.Pool` with TLS and at most five connections per
process. The runtime and Drizzle Kit use `sslmode=verify-full` by default and
trust the bundled Supabase CA for Supabase connections. Keep `certs/` alongside
`package.json` in deployments and run commands from the server root. Queries
are unnamed by default for transaction pooling compatibility;
avoid named prepared queries and session-dependent state such as session-level
`SET` or temporary tables across transactions.

For later schema changes, run `npm run db:generate`, review the generated SQL,
then run `npm run db:migrate`. Generating SQL validates `DATABASE_URL` but does
not connect to Supabase. `npm run db:studio` opens the database browser once the
URL is configured.

All application environment variables are defined in the shared Zod schema in
`src/validations/env.schema.ts`. `src/env.ts` imports that schema, loads `.env`,
and exports validated values. Import `{ env }` from `src/env.ts` and use
`env.DATABASE_URL` instead of reading `process.env` directly. Missing, blank,
malformed, or non-PostgreSQL URLs fail validation when the module loads. Add
future variables to the shared schema and `.env.example` so consumers receive
validated, typed values. `.env` itself contains only variable values.

Keep future Zod schemas in `src/validations/` and import them where needed.
`AGENTS.md` records these conventions for future changes.

## Database schema

Table definitions live in `src/db/schema/` and are exported through its
`index.ts`. `enums.ts` holds PostgreSQL enums and `columns.ts` supplies shared
timezone-aware timestamps. Every table has a UUID primary key. These are
starter columns; no seed rows are inserted.

| Table | Sample columns and relationships | Main indexes |
| --- | --- | --- |
| `product_categories` | Name, slug, description, banner image, sort order, active status | Unique slug; name; active status + sort order |
| `product_types` | Category ID, name, slug, description, banner image, sort order, active status | Unique category/slug and ID/category pairs; name; category + active status + sort order |
| `products` | Category ID, type ID, name, slug, SKU, description, banner image, stock quantity, active status | Unique slug and SKU; category; type + category; name; created time |
| `other_user_types` | Editable name, slug, description, active status for users classified as other | Unique slug; name |
| `product_prices` | Product ID, user type enum, decimal price, currency | Unique product/type pair; user type |
| `product_documents` | Product ID, PDF name, link, MIME type, sort order | Product ID + sort order |
| `product_media` | Product ID, image/video type, name, link, alt text, sort order | Product ID + sort order |
| `users` | User type enum, optional other type ID, name, email, phone, company, type verification, total loyalty points | Unique case-insensitive email and unique phone; type + verification; other type; created time |
| `user_notifications` | User ID, title, message, type, link, read flag and time | User + created time; user + read flag + created time |
| `user_documents` | User ID, name, document type, link, verification flag and time | User + document type; verification + created time |
| `user_points_ledger` | User ID, entry type, signed points, balance after entry, description, reference, optional retry key | User + created time; reference; unique user/retry-key pair |
| `enquiries` | Optional user/product IDs, contact details, subject, message, status | User + created time; product + created time; status + created time |
| `newsletter_subscriptions` | Email, subscribed flag, subscription/unsubscription times, status update time | Unique case-insensitive email; subscribed flag + status update time; created time |
| `blogs` | Optional author ID, title, slug, excerpt, content, cover image, publication flag and time | Unique slug; created time; publication flag + publication time; author + created time |
| `careers` | Title, slug, department, location, employment type, description, requirements, experience, application email/link, active status, closing time | Unique slug; active status + created time; department |

### Product categories and types

Each product category can contain many product types. Every product type has
one required `productCategoryId`. Every product has required
`productCategoryId` and `productTypeId` fields. A composite foreign key ensures
that its selected type belongs to its selected category. Type slugs are unique
within their category; category and product slugs are globally unique in their
respective tables. Referenced categories and types cannot be deleted while
their dependent records exist.

### Blogs and careers

Blogs start as unpublished drafts. Application code sets `publishedAt` when
publishing. An optional author references a user; deleting the author preserves
the blog and sets `authorId` to null. Careers contain sample job listing fields,
with `isActive` controlling visibility and optional `closesAt` for the closing
date. Application code must enforce publication and closing-date behavior.

### User types and verification

The shared `user_type` enum contains `normal`, `dealer`, `oem`, `epc`, and
`other`. Both `users.userType` and `product_prices.userType` use this enum
directly. Users default to `normal`; a price must specify its user type.

`other_user_types` holds editable classifications only for users whose
`userType` is `other`. `users.otherUserTypeId` is an optional foreign key to
that table. Application code must clear it for all other enum values; there
are no SQL check constraints enforcing this rule. Product prices have no
other-type column or reference: every user with type `other` uses the product's
single `other` price.

A user's `isVerified` flag applies to their current classification. Application
code must reset verification when changing `userType` or `otherUserTypeId`;
the schema does not do this automatically. User document verification is
tracked independently.

### Pricing and product files

Prices and image/video links are stored only in their separate tables. Each
product/type pair has one price, with its own required currency. Pass decimal
prices as strings (for example `"1250.00"`) to retain precision. Documents and
media use `sortOrder` to control display order.

### Points and subscription history

Ledger types are `earned`, `redeemed`, `refunded`, `expired`, and `adjustment`.
Earned/refunded entries use positive points, redeemed/expired entries use
negative points, and adjustments may use either sign. Application code must
insert a ledger entry and update `users.totalLoyaltyPoints` in one database
transaction, serializing changes for the same user to keep balances correct.
The schema does not implement automatic balance updates or enforce ledger
immutability. Supply a stable `idempotencyKey` when retrying a points operation
to prevent duplicate entries for that user.

Newsletter `updatedAt` tracks any Drizzle update. Application code must set
`statusUpdatedAt` only when the subscription status changes, and maintain
`subscribedAt` / `unsubscribedAt` on subscription changes.

### Foreign keys and constraints

Deleting a product cascades to its prices, documents, and media. Deleting a
user cascades to notifications and documents, while existing points history
prevents deletion of that user. Enquiries retain their contact information if
a linked user or product is deleted, with the corresponding foreign key set to
null. Referenced other user types cannot be deleted while users use them.

Row level security and custom SQL check constraints are absent from the schema.
Primary keys, foreign keys, uniqueness, required columns, and enums remain.
`updatedAt` is refreshed by Drizzle updates; direct SQL updates must set it
explicitly. Ledger entries only have `createdAt` because they represent history.

The composite product-type/category key is a table-level unique constraint so
it exists before the product foreign key is created. Keep generated migration
SQL and its snapshot in sync when reviewing migration changes.

```ts
import { db } from "./db/index.js";
import { products, productPrices, type UserType } from "./db/schema/index.js";

// Assign a price directly to one of the shared enum values.
async function createProduct(
  userType: UserType,
  productCategoryId: string,
  productTypeId: string,
) {
  return db.transaction(async (tx) => {
    const [product] = await tx.insert(products).values({
      productCategoryId,
      productTypeId,
      name: "Example product",
      slug: "example-product",
    }).returning();

    if (!product) throw new Error("Product was not created");

    await tx.insert(productPrices).values({
      productId: product.id,
      userType,
      price: "1250.00",
      currency: "INR",
    });

    return product;
  });
}
```

Use `npm run typecheck` to check types and `npm run build` to compile to `dist/`.
