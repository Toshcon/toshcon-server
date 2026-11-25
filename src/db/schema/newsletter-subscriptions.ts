import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.js";

export const newsletterSubscriptions = pgTable(
  "newsletter_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    isSubscribed: boolean("is_subscribed").default(true).notNull(),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    // Set explicitly whenever isSubscribed changes, including resubscriptions.
    statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("newsletter_subscriptions_email_idx").on(
      sql`lower(${table.email})`,
    ),
    index("newsletter_subscriptions_status_updated_at_idx").on(
      table.isSubscribed,
      table.statusUpdatedAt,
    ),
    index("newsletter_subscriptions_created_at_idx").on(table.createdAt),
  ],
);

export type NewsletterSubscription =
  typeof newsletterSubscriptions.$inferSelect;
export type NewNewsletterSubscription =
  typeof newsletterSubscriptions.$inferInsert;
