import { 
  users, type User, type InsertUser,
  receipts, type Receipt, type InsertReceipt,
  receiptItems, type ReceiptItem, type InsertReceiptItem
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private receiptData: Map<number, Receipt>;
  private receiptItemsData: Map<number, ReceiptItem>;
  currentId: number;
  currentReceiptId: number;
  currentReceiptItemId: number;

  constructor() {
    this.users = new Map();
    this.receiptData = new Map();
    this.receiptItemsData = new Map();
    this.currentId = 1;
    this.currentReceiptId = 1;
    this.currentReceiptItemId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = this.currentReceiptId++;
    const receipt: Receipt = { ...insertReceipt, id };
    this.receiptData.set(id, receipt);
    return receipt;
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    return this.receiptData.get(id);
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return Array.from(this.receiptData.values());
  }

  async createReceiptItem(insertItem: InsertReceiptItem): Promise<ReceiptItem> {
    const id = this.currentReceiptItemId++;
    const item: ReceiptItem = { ...insertItem, id };
    this.receiptItemsData.set(id, item);
    return item;
  }

  async getReceiptItems(receiptId: number): Promise<ReceiptItem[]> {
    return Array.from(this.receiptItemsData.values()).filter(
      (item) => item.receiptId === receiptId
    );
  }

  async deleteReceiptItem(id: number): Promise<void> {
    this.receiptItemsData.delete(id);
  }
}

export const storage = new MemStorage();
