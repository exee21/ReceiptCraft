import { 
  users, type User, type InsertUser,
  receipts, type Receipt, type InsertReceipt,
  receiptItems, type ReceiptItem, type InsertReceiptItem
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Receipt methods
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceipt(id: number): Promise<Receipt | undefined>;
  getAllReceipts(): Promise<Receipt[]>;
  
  // Receipt Items methods
  createReceiptItem(item: InsertReceiptItem): Promise<ReceiptItem>;
  getReceiptItems(receiptId: number): Promise<ReceiptItem[]>;
  deleteReceiptItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const result = await db.insert(receipts).values(insertReceipt).returning();
    return result[0];
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    const result = await db.select().from(receipts).where(eq(receipts.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts);
  }

  async createReceiptItem(insertItem: InsertReceiptItem): Promise<ReceiptItem> {
    const result = await db.insert(receiptItems).values(insertItem).returning();
    return result[0];
  }

  async getReceiptItems(receiptId: number): Promise<ReceiptItem[]> {
    return await db.select().from(receiptItems).where(eq(receiptItems.receiptId, receiptId));
  }

  async deleteReceiptItem(id: number): Promise<void> {
    await db.delete(receiptItems).where(eq(receiptItems.id, id));
  }
}

export const storage = new DatabaseStorage();
