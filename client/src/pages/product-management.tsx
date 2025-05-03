import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/receiptUtils';
import { Product } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { PlusCircle, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // For product form 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all products or search products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/products?search=${encodeURIComponent(searchTerm)}`
        : '/api/products';
      const data = await apiRequest<Product[]>(url);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount and when search term changes
  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  // Open dialog for adding new product
  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setProductName('');
    setProductPrice('');
    setProductSku('');
    setProductDescription('');
    setProductCategory('');
    setIsDialogOpen(true);
  };

  // Open dialog for editing product
  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductSku(product.sku);
    setProductDescription(product.description || '');
    setProductCategory(product.category || '');
    setIsDialogOpen(true);
  };

  // Handle delete product
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      // Refresh product list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!productName || !productPrice || !productSku) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(productPrice);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name: productName,
        price,
        sku: productSku,
        description: productDescription || null,
        category: productCategory || null
      };

      if (isEditing && currentProduct) {
        // Update existing product
        await apiRequest(`/api/products/${currentProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(productData)
        });
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        await apiRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify(productData)
        });
        toast({
          title: "Success",
          description: "Product added successfully",
        });
      }
      
      // Close dialog and refresh list
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} product`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Product Management
        </h1>
        <p className="text-gray-600">Add, edit, and delete products in your catalog</p>
      </header>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleAddNew}
              className="bg-red-600 hover:bg-red-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No products found. {searchTerm && 'Try a different search term or '} 
                      <Button 
                        variant="link"
                        className="text-red-600 p-0 h-auto"
                        onClick={handleAddNew}
                      >
                        add a new product
                      </Button>.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the product details below.' 
                : 'Fill in the product details to add it to your catalog.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productPrice">Price ($) *</Label>
                <Input
                  id="productPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productSku">SKU *</Label>
                <Input
                  id="productSku"
                  placeholder="Enter SKU"
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productCategory">Category</Label>
              <Input
                id="productCategory"
                placeholder="Enter category (optional)"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Description</Label>
              <Input
                id="productDescription"
                placeholder="Enter description (optional)"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              {isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}