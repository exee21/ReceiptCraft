import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Receipt, Search, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  // Check for dark mode preference on component mount
  useEffect(() => {
    // Check if user has a preference stored in localStorage
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference) {
      setDarkMode(savedPreference === 'true');
    } else {
      // Check if user prefers dark mode in their system settings
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode class to the document body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <nav className="bg-background border-b p-4 mb-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-xl font-bold text-foreground">CVS Receipt Generator</h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="mr-2"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Separator orientation="vertical" className="h-8 hidden md:block" />
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

          <Link href="/scanner">
            <Button 
              variant={location === '/scanner' ? 'default' : 'outline'} 
              size="sm"
              className="flex items-center"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scanner
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}