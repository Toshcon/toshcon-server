import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.js";
import { productCategories } from "./product-categories.js";
import { productTypes } from "./product-types.js";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productCategoryId: uuid("product_category_id")
      .notNull()
      .references(() => productCategories.id, { onDelete: "restrict" }),
    productTypeId: uuid("product_type_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku").unique(),
    description: text("description"),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    bannerImage: text("banner_image"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps(),
  },
  (table) => [
    foreignKey({
      name: "products_type_category_fk",
      columns: [table.productTypeId, table.productCategoryId],
      foreignColumns: [productTypes.id, productTypes.productCategoryId],
    }).onDelete("restrict"),
    uniqueIndex("products_slug_idx").on(table.slug),
    index("products_category_idx").on(table.productCategoryId),
    index("products_type_category_idx").on(
      table.productTypeId,
      table.productCategoryId,
    ),
    index("products_created_at_idx").on(table.createdAt),
    index("products_name_idx").on(table.name),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
