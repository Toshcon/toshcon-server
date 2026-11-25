import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { pointsEntryTypeEnum } from "./enums.js";
import { users } from "./users.js";

// Append entries and update users.totalLoyaltyPoints in the same transaction.
export const userPointsLedger = pgTable(
  "user_points_ledger",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    type: pointsEntryTypeEnum("type").notNull(),
    // Positive for earned/refunded points, negative for redeemed/expired points.
    points: integer("points").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    description: text("description"),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    // Optional retry key scoped to a user to prevent duplicate ledger entries.
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_points_ledger_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    uniqueIndex("user_points_ledger_user_idempotency_idx").on(
      table.userId,
      table.idempotencyKey,
    ),
  ],
);

export type UserPointsLedgerEntry = typeof userPointsLedger.$inferSelect;
export type NewUserPointsLedgerEntry = typeof userPointsLedger.$inferInsert;
