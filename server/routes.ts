import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReceiptSchema, insertReceiptItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = express.Router();

  // Receipt endpoints
  apiRouter.post("/receipts", async (req, res) => {
    try {
      const receiptData = insertReceiptSchema.parse(req.body);
      const receipt = await storage.createReceipt(receiptData);
      res.status(201).json(receipt);
    } catch (error) {
      res.status(400).json({ message: "Invalid receipt data", error });
    }
  });

  apiRouter.get("/receipts", async (req, res) => {
    try {
      const receipts = await storage.getAllReceipts();
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get receipts", error });
    }
  });

  apiRouter.get("/receipts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const receipt = await storage.getReceipt(id);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ message: "Failed to get receipt", error });
    }
  });

  // Receipt items endpoints
  apiRouter.post("/receipt-items", async (req, res) => {
    try {
      const itemData = insertReceiptItemSchema.parse(req.body);
      const item = await storage.createReceiptItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid receipt item data", error });
    }
  });

  apiRouter.get("/receipts/:id/items", async (req, res) => {
    try {
      const receiptId = parseInt(req.params.id);
      const items = await storage.getReceiptItems(receiptId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get receipt items", error });
    }
  });

  apiRouter.delete("/receipt-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReceiptItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete receipt item", error });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
