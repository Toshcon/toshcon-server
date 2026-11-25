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

export const careers = pgTable(
  "careers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: text("slug").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    department: text("department"),
    location: text("location").notNull(),
    employmentType: text("employment_type").default("full_time").notNull(),
    description: text("description").notNull(),
    requirements: text("requirements"),
    experience: text("experience"),
    applicationEmail: text("application_email"),
    applicationLink: text("application_link"),
    isActive: boolean("is_active").default(true).notNull(),
    closesAt: timestamp("closes_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("careers_slug_idx").on(table.slug),
    index("careers_active_created_at_idx").on(table.isActive, table.createdAt),
    index("careers_department_idx").on(table.department),
    index("careers_job_idx").on(table.jobId),
  ],
);

export type Career = typeof careers.$inferSelect;
export type NewCareer = typeof careers.$inferInsert;
