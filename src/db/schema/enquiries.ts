import { index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./columns.js";
import { enquiryStatusEnum } from "./enums.js";
import { products } from "./products.js";
import { users } from "./users.js";

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Nullable links allow enquiries from visitors and general enquiries.
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // multiple products so add enquires items.
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    companyName: text("company_name"),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: enquiryStatusEnum("status").default("new").notNull(),
    ...timestamps(),
  },
  (table) => [
    index("enquiries_created_at_idx").on(table.createdAt),
    index("enquiries_user_created_at_idx").on(table.userId, table.createdAt),
    index("enquiries_product_created_at_idx").on(
      table.productId,
      table.createdAt,
    ),
  ],
);

export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
