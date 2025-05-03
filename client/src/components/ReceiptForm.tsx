import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReceiptItem } from '@/types';
import { Printer, RefreshCw, Plus } from 'lucide-react';

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

    addItem({
      name: productName,
      price,
      sku: productSku
    });

    // Clear form
    setProductName('');
    setProductPrice('');
    setProductSku('');
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
        
        <h3 className="text-lg font-semibold">Product Entry</h3>
        
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
