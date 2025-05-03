import { pgTable, text, serial, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const receiptItems = pgTable("receipt_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: numeric("price").notNull(),
  sku: text("sku").notNull(),
  receiptId: integer("receipt_id").notNull(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  taxRate: numeric("tax_rate").notNull(),
  regNumber: text("reg_number").notNull(),
  transNumber: text("trans_number").notNull(),
  helperName: text("helper_name").notNull(),
  cashierNumber: text("cashier_number").notNull(),
  storeNumber: text("store_number").notNull(),
  cardLastFour: text("card_last_four").notNull(),
  authCode: text("auth_code").notNull(),
  aidCode: text("aid_code").notNull(),
  randomNumbers: text("random_numbers").array().notNull(),
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
});

export const insertReceiptItemSchema = createInsertSchema(receiptItems).omit({
  id: true,
});

// Products table for product information lookup
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: numeric("price").notNull(),
  sku: text("sku").notNull().unique(),
  description: text("description"),
  category: text("category"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;
export type InsertReceiptItem = z.infer<typeof insertReceiptItemSchema>;
export type ReceiptItem = typeof receiptItems.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
