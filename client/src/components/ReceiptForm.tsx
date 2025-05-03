import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReceiptItem, Product } from '@/types';
import { Printer, RefreshCw, Plus, Search, Package2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/receiptUtils';

interface ReceiptFormProps {
  addItem: (item: ReceiptItem) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  newReceipt: () => void;
  printReceipt: () => void;
  receiptDate: string;
  receiptTime: string;
  setReceiptDate: (date: string) => void;
  setReceiptTime: (time: string) => void;
}

const ReceiptForm = ({
  addItem,
  taxRate,
  setTaxRate,
  newReceipt,
  printReceipt,
  receiptDate,
  receiptTime,
  setReceiptDate,
  setReceiptTime
}: ReceiptFormProps) => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productSku, setProductSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products for the catalog
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/products?search=${encodeURIComponent(searchTerm)}`
        : '/api/products';
      const results = await apiRequest<Product[]>(url, { method: 'GET' });
      setProducts(results);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load products when search term changes or when dialog opens
  useEffect(() => {
    if (showProductSelector) {
      fetchProducts();
    }
  }, [searchTerm, showProductSelector]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductSku(product.sku);
    setShowProductSelector(false);
  };

  const handleAddItem = () => {
    if (!productName || !productPrice || !productSku) {
      alert('Please fill in all fields');
      return;
    }

    const price = parseFloat(productPrice);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }

    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    // If quantity is greater than 1, add multiple separate items instead of one with quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        name: productName,
        price,
        sku: productSku,
        quantity: 1
      });
    }

    // Clear form
    setProductName('');
    setProductPrice('');
    setProductSku('');
    setQuantity(1);
    setSelectedProduct(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Receipt Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="receiptDate">Date</Label>
            <Input
              type="date"
              id="receiptDate"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="receiptTime">Time</Label>
            <Input
              type="time"
              id="receiptTime"
              value={receiptTime}
              onChange={(e) => setReceiptTime(e.target.value)}
            />
          </div>
        </div>

        <Separator />
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Product Entry</h3>
          <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center"
              >
                <Package2 className="h-4 w-4 mr-1" /> Select Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Select a Product</DialogTitle>
                <DialogDescription>
                  Search for and select a product from the catalog
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={fetchProducts} disabled={loading}>
                    {loading ? <Search className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="border rounded-md h-64 overflow-auto">
                  {products.length > 0 ? (
                    <div className="divide-y">
                      {products.map((product) => (
                        <div 
                          key={product.id} 
                          className="p-3 hover:bg-accent cursor-pointer"
                          onClick={() => handleSelectProduct(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>SKU: {product.sku}</span>
                            <span>{formatCurrency(Number(product.price))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {loading ? 'Loading...' : 'No products found. Try searching for something else.'}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowProductSelector(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              type="text"
              id="productName"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="productPrice">Price ($)</Label>
              <Input
                type="number"
                id="productPrice"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="productSku">SKU</Label>
              <Input
                type="text"
                id="productSku"
                placeholder="123456789"
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddItem}
              variant="default"
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
        </div>

        <Separator />
        
        <div className="space-y-1">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            type="number"
            id="taxRate"
            step="0.01"
            min="0"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="pt-4 flex justify-between">
          <Button 
            onClick={newReceipt} 
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> New Receipt
          </Button>
          <Button 
            onClick={printReceipt} 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-1" /> Print Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptForm;
