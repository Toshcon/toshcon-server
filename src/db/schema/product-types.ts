import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.js";
import { productCategories } from "./product-categories.js";

export const productTypes = pgTable(
  "product_types",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productCategoryId: uuid("product_category_id")
      .notNull()
      .references(() => productCategories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    bannerImage: text("banner_image"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("product_types_category_slug_idx").on(
      table.productCategoryId,
      table.slug,
    ),
    // A table constraint exists before Drizzle adds foreign keys in migrations.
    unique("product_types_id_category_unique").on(
      table.id,
      table.productCategoryId,
    ),
    index("product_types_name_idx").on(table.name),
    index("product_types_category_active_order_idx").on(
      table.productCategoryId,
      table.isActive,
      table.sortOrder,
    ),
  ],
);

export type ProductType = typeof productTypes.$inferSelect;
export type NewProductType = typeof productTypes.$inferInsert;
