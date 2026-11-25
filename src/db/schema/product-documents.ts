import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.js";
import { products } from "./products.js";

export const productDocuments = pgTable(
  "product_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    link: text("link").notNull(),
    mimeType: text("mime_type").default("application/pdf").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps(),
  },
  (table) => [
    index("product_documents_product_order_idx").on(
      table.productId,
      table.sortOrder,
    ),
  ],
);

export type ProductDocument = typeof productDocuments.$inferSelect;
export type NewProductDocument = typeof productDocuments.$inferInsert;
