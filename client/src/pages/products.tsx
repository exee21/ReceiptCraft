import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/receiptUtils';
import { Loader, PlusCircle } from 'lucide-react';
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
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    description: '',
  });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const { toast } = useToast();

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
    // We'll implement this functionality later
    toast({
      title: "Product added",
      description: `${product.name} added to receipt`,
    });
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
        <CardHeader>
          <CardTitle className="text-2xl">Product Search</CardTitle>
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
    </div>
  );
}