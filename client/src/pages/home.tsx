import { useState, useEffect, useRef } from 'react';
import ReceiptForm from '@/components/ReceiptForm';
import ReceiptPreview from '@/components/ReceiptPreview';
import ItemsTable from '@/components/ItemsTable';
import { ReceiptItem, ReceiptInfo } from '@/types';
import { generateReceiptInfo, getFormattedDateTime, generatePrintHTML } from '@/lib/receiptUtils';
import { format, parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
    </div>
  );
};

export default Home;
