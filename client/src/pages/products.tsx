import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/receiptUtils';
import { Loader, PlusCircle, Download, Upload, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    description: '',
  });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a product name to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    
    try {
      const url = `/api/products?search=${encodeURIComponent(searchTerm)}`;
      const results = await apiRequest<Product[]>(url, { method: 'GET' });
      setProducts(results);
      
      if (results.length === 0) {
        toast({
          title: "No products found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: "Search failed",
        description: "There was an error searching for products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToReceipt = (product: Product) => {
    // Prompt user for quantity
    const quantityStr = prompt("Enter quantity:", "1");
    
    // Validate quantity
    if (!quantityStr) return; // User cancelled
    
    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity < 1) {
      toast({
        title: "Invalid quantity",
        description: "Quantity must be a positive number",
        variant: "destructive"
      });
      return;
    }
    
    // Create the receipt item
    const receiptItem = {
      name: product.name,
      price: Number(product.price),
      sku: product.sku,
      quantity: 1 // Always use 1 as we'll add individual items instead of using quantity
    };
    
    // Store product in session storage for the home page to pick up
    sessionStorage.setItem('scannedProduct', JSON.stringify(receiptItem));
    
    // Add to receipt and show toast
    toast({
      title: "Product added",
      description: `${quantity} ${product.name} added to receipt`,
    });
    
    // Navigate back to the home page
    navigate('/');
  };
  
  // Function to handle exporting products
  const handleExportProducts = () => {
    // First make sure we have products to export
    if (!products.length) {
      toast({
        title: "No products to export",
        description: "Please search for products first",
        variant: "destructive",
      });
      return;
    }
    
    // Format products for export
    const exportData = products.map(product => ({
      name: product.name,
      sku: product.sku,
      price: product.price,
      description: product.description || ''
    }));
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cvs-products-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    toast({
      title: "Export successful",
      description: `${products.length} products exported to JSON`,
    });
  };
  
  // Function to handle importing products
  const handleImportProducts = async () => {
    setImporting(true);
    setImportError(null);
    
    try {
      if (!importData.trim()) {
        setImportError("Please enter product data");
        return;
      }
      
      // Parse the JSON data
      let productsToImport: any[];
      try {
        productsToImport = JSON.parse(importData);
        if (!Array.isArray(productsToImport)) {
          throw new Error("Import data must be an array");
        }
      } catch (error) {
        setImportError("Invalid JSON format. Please check your data.");
        setImporting(false);
        return;
      }
      
      // Validate the product data
      const invalidProducts = productsToImport.filter(p => 
        !p.name || !p.sku || !p.price || isNaN(Number(p.price))
      );
      
      if (invalidProducts.length > 0) {
        setImportError(`${invalidProducts.length} product(s) have invalid data. All products must have name, sku, and valid price.`);
        setImporting(false);
        return;
      }
      
      // Import each product
      const successfulImports: Product[] = [];
      let importErrors = 0;
      
      for (const product of productsToImport) {
        try {
          const productData = {
            name: product.name,
            sku: product.sku,
            price: String(product.price),
            description: product.description || null,
            category: product.category || null
          };
          
          const result = await apiRequest<Product>('/api/products', { 
            method: 'POST',
            body: JSON.stringify(productData)
          });
          
          successfulImports.push(result);
        } catch (error) {
          console.error(`Error importing product ${product.name}:`, error);
          importErrors++;
        }
      }
      
      // Update the UI
      if (successfulImports.length > 0) {
        setProducts(prev => [...successfulImports, ...prev]);
        
        toast({
          title: "Import successful",
          description: `${successfulImports.length} product(s) imported successfully${importErrors > 0 ? `, ${importErrors} failed` : ''}`,
        });
        
        // Close the dialog and reset
        setShowImportDialog(false);
        setImportData('');
      } else {
        setImportError("No products were imported. Please check your data and try again.");
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportError("An error occurred during import. Please try again.");
    } finally {
      setImporting(false);
    }
  };
  
  // Function for file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content || '');
    };
    reader.readAsText(file);
  };
  
  const handleCreateProduct = async () => {
    // Validate fields
    if (!newProduct.name?.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a product name",
        variant: "destructive",
      });
      return;
    }
    
    if (!newProduct.sku?.trim()) {
      toast({
        title: "SKU required",
        description: "Please enter a product SKU",
        variant: "destructive",
      });
      return;
    }
    
    if (!newProduct.price || Number(newProduct.price) <= 0) {
      toast({
        title: "Valid price required",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    setCreatingProduct(true);
    
    try {
      // Create a properly formatted product data object
      const productData = {
        name: newProduct.name,
        sku: newProduct.sku,
        price: String(newProduct.price), // Convert to string for numeric column
        description: newProduct.description || null,
        category: newProduct.category || null
      };
      
      console.log("Sending product data:", productData);
      
      const result = await apiRequest<Product>('/api/products', { 
        method: 'POST',
        body: JSON.stringify(productData)
      });
      
      // Add the new product to the results
      setProducts(prev => [result, ...prev]);
      
      // Close the dialog and reset form
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        sku: '',
        price: 0,
        description: '',
      });
      
      toast({
        title: "Product created",
        description: `${result.name} has been added to the database`,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Failed to create product",
        description: "There was an error adding the product to the database",
        variant: "destructive",
      });
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Product Search</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-1" /> Import Products
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProducts}
              className="flex items-center"
              disabled={products.length === 0}
            >
              <Download className="h-4 w-4 mr-1" /> Export Products
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              {loading ? 'Searching...' : `Search Results (${products.length})`}
            </CardTitle>
            <Button 
              onClick={() => {
                setNewProduct({
                  name: searchTerm,
                  sku: '',
                  price: 0,
                  description: '',
                });
                setShowAddProduct(true);
              }}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add New Product
            </Button>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddToReceipt(product)}
                        >
                          Add to Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No products found matching "{searchTerm}"
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center py-16">
                <Loader className="h-8 w-8 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter product details to add to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right font-medium">
                Name
              </label>
              <Input
                id="name"
                value={newProduct.name || ''}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="col-span-3"
                placeholder="Product name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sku" className="text-right font-medium">
                SKU
              </label>
              <Input
                id="sku"
                value={newProduct.sku || ''}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                className="col-span-3"
                placeholder="Product SKU"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right font-medium">
                Price
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={Number(newProduct.price) || ''}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right font-medium">
                Description
              </label>
              <Input
                id="description"
                value={newProduct.description || ''}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="col-span-3"
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddProduct(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProduct}
              disabled={creatingProduct}
            >
              {creatingProduct ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Products Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Import products from a JSON file or paste directly in the format below.
            </DialogDescription>
          </DialogHeader>
          
          {importError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-1" /> Choose File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <p className="text-sm text-gray-500">
                Expected format: [{"{name, sku, price, description}"}]
              </p>
            </div>
            
            <div className="border rounded-md p-2">
              <p className="text-sm font-medium mb-2">JSON Data Format Example:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
{`[
  {
    "name": "Product Name",
    "sku": "123456789",
    "price": 9.99,
    "description": "Product description"
  },
  {
    "name": "Another Product",
    "sku": "987654321",
    "price": 19.99,
    "description": "Another description"
  }
]`}
              </pre>
            </div>
            
            <div>
              <label htmlFor="importData" className="text-sm font-medium">
                Paste JSON Data:
              </label>
              <textarea
                id="importData"
                className="mt-1 w-full h-32 p-2 border rounded-md"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON data here..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowImportDialog(false);
                setImportError(null);
                setImportData('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImportProducts}
              disabled={importing || !importData.trim()}
            >
              {importing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : 'Import Products'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}