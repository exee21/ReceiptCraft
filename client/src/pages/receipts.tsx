import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Receipt, ReceiptItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import ReceiptPreview from '@/components/ReceiptPreview';
import { generatePrintHTML } from '@/lib/receiptUtils';

const ReceiptsPage = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const receiptRef = useRef<HTMLDivElement | null>(null);

  // Fetch all receipts
  const { data: receipts, isLoading: receiptsLoading, error: receiptsError } = useQuery({
    queryKey: ['/api/receipts'],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string);
      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }
      return response.json() as Promise<Receipt[]>;
    }
  });

  // Fetch receipt items when a receipt is selected
  const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: [selectedReceipt ? `/api/receipts/${selectedReceipt.id}/items` : ''],
    queryFn: async ({ queryKey }) => {
      if (!selectedReceipt) return [];
      const response = await fetch(queryKey[0] as string);
      if (!response.ok) {
        throw new Error('Failed to fetch receipt items');
      }
      return response.json() as Promise<ReceiptItem[]>;
    },
    enabled: !!selectedReceipt
  });

  useEffect(() => {
    if (items) {
      setReceiptItems(items);
    }
  }, [items]);

  if (receiptsLoading) {
    return <div className="container mx-auto px-4 py-8">Loading receipts...</div>;
  }

  if (receiptsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">Error loading receipts: {(receiptsError as Error).message}</div>
        <Button onClick={() => setLocation('/')} className="mt-4">Back to Home</Button>
      </div>
    );
  }
  
  const printReceipt = () => {
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch {
      return dateString;
    }
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Saved Receipts
        </h1>
        <p className="text-gray-600">View and manage your saved CVS receipts</p>
      </header>

      <div className="mb-4">
        <Link href="/">
          <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            Back to Generator
          </Button>
        </Link>
      </div>

      {receipts && receipts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No receipts found</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Create Your First Receipt
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts?.map((receipt) => (
            <Card key={receipt.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{formatDate(receipt.date)} {receipt.time}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Register: {receipt.regNumber}</p>
                  <p>Transaction: {receipt.transNumber}</p>
                  <p>Cashier: {receipt.helperName}</p>
                  <p>Tax Rate: {Number(receipt.taxRate).toFixed(2)}%</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleViewReceipt(receipt)}
                >
                  View Receipt
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Receipt #{selectedReceipt.id}</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={printReceipt}
                  >
                    Print
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setSelectedReceipt(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {itemsLoading ? (
                <div className="text-center py-10">Loading receipt details...</div>
              ) : itemsError ? (
                <div className="text-center py-10 text-red-600">
                  Error loading receipt items: {(itemsError as Error).message}
                </div>
              ) : (
                <div ref={receiptRef}>
                  <ReceiptPreview
                    items={receiptItems}
                    receiptInfo={{
                      regNumber: selectedReceipt.regNumber,
                      transNumber: selectedReceipt.transNumber,
                      cashierNumber: selectedReceipt.cashierNumber,
                      storeNumber: selectedReceipt.storeNumber,
                      cardLastFour: selectedReceipt.cardLastFour,
                      authCode: selectedReceipt.authCode,
                      aidCode: selectedReceipt.aidCode,
                      randomNumbers: selectedReceipt.randomNumbers,
                      date: selectedReceipt.date,
                      time: selectedReceipt.time,
                      helperName: selectedReceipt.helperName
                    }}
                    taxRate={Number(selectedReceipt.taxRate)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;