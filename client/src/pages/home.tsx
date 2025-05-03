import { useState, useEffect, useRef } from 'react';
import ReceiptForm from '@/components/ReceiptForm';
import ReceiptPreview from '@/components/ReceiptPreview';
import ItemsTable from '@/components/ItemsTable';
import { ReceiptItem, ReceiptInfo, Receipt, InsertReceipt } from '@/types';
import { generateReceiptInfo, getFormattedDateTime, generatePrintHTML } from '@/lib/receiptUtils';
import { format, parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const Home = () => {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [taxRate, setTaxRate] = useState(8.5);
  const [receiptInfo, setReceiptInfo] = useState<ReceiptInfo>(generateReceiptInfo());
  const [dateInput, setDateInput] = useState(getFormattedDateTime().date);
  const [timeInput, setTimeInput] = useState(getFormattedDateTime().time);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update receipt date and time when inputs change
  useEffect(() => {
    try {
      const dateObj = parse(`${dateInput} ${timeInput}`, 'yyyy-MM-dd HH:mm', new Date());
      
      setReceiptInfo(prev => ({
        ...prev,
        date: format(dateObj, 'MM/dd/yyyy'),
        time: format(dateObj, 'hh:mm a')
      }));
    } catch (error) {
      // Handle invalid date/time format
      console.error('Invalid date or time format', error);
    }
  }, [dateInput, timeInput]);
  
  // Check for scanned products from scanner page
  useEffect(() => {
    const scannedProductString = sessionStorage.getItem('scannedProduct');
    if (scannedProductString) {
      try {
        const scannedProduct = JSON.parse(scannedProductString);
        // Add the scanned product to the receipt
        if (scannedProduct && scannedProduct.name && scannedProduct.price) {
          addItem({
            name: scannedProduct.name,
            price: Number(scannedProduct.price),
            sku: scannedProduct.sku || '',
            quantity: 1
          });
          
          toast({
            title: "Scanned Product Added",
            description: `${scannedProduct.name} added from scanner`,
          });
        }
        
        // Clear the sessionStorage
        sessionStorage.removeItem('scannedProduct');
      } catch (error) {
        console.error('Error processing scanned product:', error);
      }
    }
  }, []);

  const addItem = (item: ReceiptItem) => {
    setItems([...items, item]);
    
    toast({
      title: "Item Added",
      description: `${item.name} added to receipt`,
    });
  };

  const editItem = (index: number) => {
    // This would normally open a modal or form to edit
    // For simplicity, we'll just remove it and let the user add it again with edits
    const item = items[index];
    
    // Remove the item
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    
    // Show toast
    toast({
      title: "Edit Item",
      description: `${item.name} removed for editing`,
    });
  };

  const deleteItem = (index: number) => {
    const itemName = items[index].name;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    
    toast({
      title: "Item Deleted",
      description: `${itemName} removed from receipt`,
      variant: "destructive",
    });
  };

  const newReceipt = () => {
    if (items.length > 0) {
      const confirm = window.confirm('Create a new receipt? This will clear all current items.');
      if (!confirm) return;
    }
    
    setItems([]);
    setReceiptInfo(generateReceiptInfo());
    setDateInput(getFormattedDateTime().date);
    setTimeInput(getFormattedDateTime().time);
    
    toast({
      title: "New Receipt Created",
      description: "All fields have been reset",
    });
  };

  const queryClient = useQueryClient();

  // Mutation for saving the receipt to the database
  const saveReceiptMutation = useMutation({
    mutationFn: async () => {
      // First save the receipt
      const receiptData: InsertReceipt = {
        date: receiptInfo.date,
        time: receiptInfo.time,
        taxRate: taxRate,
        regNumber: receiptInfo.regNumber,
        transNumber: receiptInfo.transNumber,
        helperName: receiptInfo.helperName,
        cashierNumber: receiptInfo.cashierNumber,
        storeNumber: receiptInfo.storeNumber,
        cardLastFour: receiptInfo.cardLastFour,
        authCode: receiptInfo.authCode,
        aidCode: receiptInfo.aidCode,
        randomNumbers: receiptInfo.randomNumbers,
      };

      const response = await apiRequest(
        'POST',
        '/api/receipts',
        receiptData
      );
      const savedReceipt: Receipt = await response.json();

      // Then save each item with the receipt ID
      for (const item of items) {
        await apiRequest(
          'POST',
          '/api/receipt-items',
          {
            name: item.name,
            price: item.price,
            sku: item.sku,
            quantity: item.quantity,
            receiptId: savedReceipt.id,
          }
        );
      }

      return savedReceipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/receipts'] });
      toast({
        title: "Receipt Saved",
        description: "Your receipt has been saved to the database",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save the receipt",
        variant: "destructive",
      });
    }
  });

  const saveReceipt = () => {
    if (items.length === 0) {
      toast({
        title: "Cannot Save",
        description: "Please add at least one item before saving",
        variant: "destructive",
      });
      return;
    }

    saveReceiptMutation.mutate();
  };

  const printReceipt = () => {
    if (items.length === 0) {
      toast({
        title: "Cannot Print",
        description: "Please add at least one item before printing",
        variant: "destructive",
      });
      return;
    }
    
    if (!receiptRef.current) return;
    
    // Open a new window with the receipt HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to print the receipt",
        variant: "destructive",
      });
      return;
    }
    
    const receiptHTML = receiptRef.current.innerHTML;
    printWindow.document.write(generatePrintHTML(receiptHTML));
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          CVS Receipt Generator
        </h1>
        <p className="text-gray-600">Create and customize CVS-style receipts with real-time preview</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <ReceiptForm
            addItem={addItem}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
            newReceipt={newReceipt}
            printReceipt={printReceipt}
            receiptDate={dateInput}
            receiptTime={timeInput}
            setReceiptDate={setDateInput}
            setReceiptTime={setTimeInput}
          />
        </div>
        
        <div className="w-full lg:w-1/2">
          <div ref={receiptRef}>
            <ReceiptPreview
              items={items}
              receiptInfo={receiptInfo}
              taxRate={taxRate}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ItemsTable
          items={items}
          onEditItem={editItem}
          onDeleteItem={deleteItem}
        />
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={saveReceipt}
          disabled={saveReceiptMutation.isPending}
        >
          {saveReceiptMutation.isPending ? "Saving..." : "Save Receipt"}
        </Button>
        
        <Link href="/receipts">
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            View Saved Receipts
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
