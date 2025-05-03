import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReceiptSchema, insertReceiptItemSchema, insertProductSchema } from "@shared/schema";

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

  // Product endpoints
  apiRouter.post("/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  apiRouter.get("/products", async (req, res) => {
    try {
      const { search } = req.query;
      
      let products;
      if (search && typeof search === 'string') {
        products = await storage.searchProducts(search);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products", error });
    }
  });

  apiRouter.get("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product", error });
    }
  });

  apiRouter.get("/products/sku/:sku", async (req, res) => {
    try {
      const sku = req.params.sku;
      const product = await storage.getProductBySku(sku);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product by SKU", error });
    }
  });

  apiRouter.put("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  apiRouter.delete("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product", error });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
