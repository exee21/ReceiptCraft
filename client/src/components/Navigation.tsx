import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Receipt, Search } from 'lucide-react';

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-b p-4 mb-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-xl font-bold text-gray-800">CVS Receipt Generator</h1>
        </div>

        <div className="flex space-x-2">
          <Link href="/">
            <Button 
              variant={location === '/' ? 'default' : 'outline'} 
              size="sm"
              className="flex items-center"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Create Receipt
            </Button>
          </Link>
          
          <Link href="/receipts">
            <Button 
              variant={location === '/receipts' ? 'default' : 'outline'} 
              size="sm"
              className="flex items-center"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Saved Receipts
            </Button>
          </Link>
          
          <Link href="/products">
            <Button 
              variant={location === '/products' ? 'default' : 'outline'} 
              size="sm"
              className="flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Product Search
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}