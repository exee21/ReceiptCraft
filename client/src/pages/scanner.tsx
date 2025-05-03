import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import Webcam from 'react-webcam';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Loader, QrCode, Upload } from 'lucide-react';
import type { Product } from '@shared/schema';

export default function ScannerPage() {
  const [tab, setTab] = useState<'camera' | 'manual'>('camera');
  const [manualSku, setManualSku] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const toast = useToast();
  const [_, setLocation] = useLocation();

  // Initialize the scanner when the component mounts
  useEffect(() => {
    if (tab === 'camera' && !scannerInitialized) {
      const qrcodeRegionId = 'html5qr-code-full-region';
      
      // Clear any existing content in the scanner div
      const scannerDiv = document.getElementById(qrcodeRegionId);
      if (scannerDiv) {
        scannerDiv.innerHTML = '';
      }
      
      // Create a new scanner instance
      scannerRef.current = new Html5QrcodeScanner(
        qrcodeRegionId,
        { 
          fps: 10, 
          qrbox: 250,
          rememberLastUsedCamera: true,
        },
        /* verbose= */ false
      );
      
      // Define success callback function
      const onScanSuccess = (decodedText: string) => {
        console.log(`Scan result: ${decodedText}`);
        
        // If we detect a valid barcode, pause scanning and look up the product
        if (decodedText && /^[0-9]+$/.test(decodedText)) {
          scannerRef.current?.pause();
          handleSkuLookup(decodedText);
        }
      };
      
      // Start the scanner
      scannerRef.current.render(onScanSuccess, (errorMessage: string) => {
        console.error(errorMessage);
      });
      
      setScannerInitialized(true);
    }
    
    // Clean up the scanner when the component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [tab, scannerInitialized]);

  // Function to look up product by SKU
  const handleSkuLookup = async (sku: string) => {
    if (!sku) {
      toast.toast({
        title: "Empty SKU",
        description: "Please provide a valid SKU",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setFoundProduct(null);
    
    try {
      const product = await apiRequest<Product>(`/api/products/sku/${sku}`);
      setFoundProduct(product);
      toast.toast({
        title: "Product Found",
        description: `Found: ${product.name}`,
      });
    } catch (error) {
      console.error('Error looking up SKU:', error);
      toast.toast({
        title: "Product Not Found",
        description: `No product found with SKU: ${sku}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to add the found product to the receipt
  const handleAddToReceipt = () => {
    if (foundProduct) {
      // Prompt user for quantity
      const quantityStr = prompt("Enter quantity:", "1");
      
      // Validate quantity
      if (!quantityStr) return; // User cancelled
      
      const quantity = parseInt(quantityStr);
      if (isNaN(quantity) || quantity < 1) {
        toast.toast({
          title: "Invalid quantity",
          description: "Quantity must be a positive number",
          variant: "destructive"
        });
        return;
      }
      
      // Use sessionStorage to pass the product to the home page
      sessionStorage.setItem('scannedProduct', JSON.stringify(foundProduct));
      // Also store the quantity
      sessionStorage.setItem('scannedProductQuantity', quantity.toString());
      
      setLocation('/');
      
      toast.toast({
        title: "Product Added",
        description: `${quantity > 1 ? quantity + ' ' : ''}${foundProduct.name} will be added to your receipt`,
      });
    }
  };
  
  // Function to restart the scanner
  const handleRescan = () => {
    setFoundProduct(null);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Product Scanner</CardTitle>
          <CardDescription>
            Scan a product barcode or enter the SKU manually
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="camera" value={tab} onValueChange={(v) => setTab(v as 'camera' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">
                <QrCode className="mr-2 h-4 w-4" />
                Camera Scanner
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Upload className="mr-2 h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="mt-4">
              {!foundProduct ? (
                <div id="html5qr-code-full-region" className="w-full max-w-md mx-auto" />
              ) : (
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold">Scanned Product</h3>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="sku">Product SKU</Label>
                  <Input 
                    id="sku"
                    placeholder="Enter product SKU..."
                    value={manualSku}
                    onChange={(e) => setManualSku(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSkuLookup(manualSku);
                      }
                    }}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => handleSkuLookup(manualSku)} disabled={loading || !manualSku}>
                    {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {foundProduct && (
            <div className="mt-6 rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">{foundProduct.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">SKU:</p>
                  <p>{foundProduct.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price:</p>
                  <p>${Number(foundProduct.price).toFixed(2)}</p>
                </div>
              </div>
              {foundProduct.description && (
                <>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">Description:</p>
                  <p>{foundProduct.description}</p>
                </>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation('/')}>
            Back to Receipt
          </Button>
          
          {foundProduct ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRescan}>
                Scan Another
              </Button>
              <Button onClick={handleAddToReceipt}>
                Add to Receipt
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}