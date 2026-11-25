import {
  index,
  numeric,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.js";
import { userTypeEnum } from "./enums.js";
import { products } from "./products.js";

export const productPrices = pgTable(
  "product_prices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userType: userTypeEnum("user_type").notNull(),
    // Decimal amounts remain strings in TypeScript to preserve precision.
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("product_prices_product_user_type_idx").on(
      table.productId,
      table.userType,
    ),
    index("product_prices_user_type_idx").on(table.userType),
  ],
);

export type ProductPrice = typeof productPrices.$inferSelect;
export type NewProductPrice = typeof productPrices.$inferInsert;
