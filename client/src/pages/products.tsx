import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/receiptUtils';
import { Loader } from 'lucide-react';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
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
          <CardHeader>
            <CardTitle className="text-xl">
              {loading ? 'Searching...' : `Search Results (${products.length})`}
            </CardTitle>
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
    </div>
  );
}