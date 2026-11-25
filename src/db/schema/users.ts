import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.js";
import { userTypeEnum } from "./enums.js";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userType: userTypeEnum("user_type").default("normal").notNull(),
    // Only populate for userType "other"; clear for all other enum values.
    otherUserType: text("other_user_type"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").unique(),
    companyName: text("company_name"),
    // Reset verification when userType or otherUserTypeId changes.
    isVerified: boolean("is_verified").default(false).notNull(),
    totalLoyaltyPoints: integer("total_loyalty_points").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(sql`lower(${table.email})`),
    index("users_type_verified_idx").on(table.userType, table.isVerified),
    index("users_created_at_idx").on(table.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
