import { pgEnum } from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", [
  "normal",
  "dealer",
  "oem",
  "epc",
  "other",
]);

export type UserType = (typeof userTypeEnum.enumValues)[number];

export const productMediaTypeEnum = pgEnum("product_media_type", [
  "image",
  "video",
]);

export const pointsEntryTypeEnum = pgEnum("points_entry_type", [
  "earned",
  "redeemed",
  "refunded",
  "expired",
]);

export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "new",
  "in_progress",
  "resolved",
  "closed",
]);
