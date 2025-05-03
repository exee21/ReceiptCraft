import { 
  users, type User, type InsertUser,
  receipts, type Receipt, type InsertReceipt,
  receiptItems, type ReceiptItem, type InsertReceiptItem,
  products, type Product, type InsertProduct
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, desc, asc, sql } from "drizzle-orm";

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
  
  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
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

  async getAllReceipts(filters?: {
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
  }): Promise<Receipt[]> {
    let query = db.select().from(receipts);
    
    // Apply date filters if provided
    if (filters?.dateFrom) {
      query = query.where(eq(receipts.date, filters.dateFrom) || sql`${receipts.date} >= ${filters.dateFrom}`);
    }
    
    if (filters?.dateTo) {
      query = query.where(eq(receipts.date, filters.dateTo) || sql`${receipts.date} <= ${filters.dateTo}`);
    }
    
    // Apply search term if provided
    if (filters?.searchTerm) {
      const term = `%${filters.searchTerm}%`;
      query = query.where(
        or(
          ilike(receipts.helperName, term),
          ilike(receipts.regNumber, term),
          ilike(receipts.transNumber, term),
          ilike(receipts.storeNumber, term)
        )
      );
    }
    
    // Order by newest receipts first
    query = query.orderBy(desc(receipts.date)).orderBy(desc(receipts.time));
    
    return await query;
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

  // Product methods implementation
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.sku, sku));
    return result.length > 0 ? result[0] : undefined;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select()
      .from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.sku, `%${query}%`),
          ilike(products.description || '', `%${query}%`)
        )
      );
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product> {
    const result = await db
      .update(products)
      .set(productUpdate)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

export const storage = new DatabaseStorage();
