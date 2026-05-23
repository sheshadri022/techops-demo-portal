import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assetsTable = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number").notNull(),
  status: text("status").notNull().default("available"),
  condition: text("condition"),
  location: text("location"),
  purchaseDate: text("purchase_date").notNull(),
  warrantyExpiry: text("warranty_expiry"),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }),
  assignedToId: integer("assigned_to_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssetSchema = createInsertSchema(assetsTable).omit({ id: true, createdAt: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetsTable.$inferSelect;
