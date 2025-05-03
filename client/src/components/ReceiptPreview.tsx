import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReceiptItem, ReceiptInfo } from '@/types';
import { formatCurrency } from '@/lib/receiptUtils';
import Barcode from 'react-barcode';
import cvsLogo from '@/assets/logo_cvs_384w.png';

interface ReceiptPreviewProps {
  items: ReceiptItem[];
  receiptInfo: ReceiptInfo;
  taxRate: number;
  templateOptions?: {
    storeAddress?: string;
    storePhone?: string;
    storeName?: string;
    showBarcodeAtBottom?: boolean;
    footerText?: string;
    paperColor?: string;
    textColor?: string;
    returnDays?: number;
  };
}

const ReceiptPreview = ({ 
  items, 
  receiptInfo, 
  taxRate,
  templateOptions = {
    footerText: 'RETURNS WITH RECEIPT THRU 6/29/2025',
    showBarcodeAtBottom: true,
    paperColor: 'default',
    textColor: 'black'
  }
}: ReceiptPreviewProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  
  // Format item text and create proper spacing
  const formatItemLine = (item: ReceiptItem) => {
    const qty = item.quantity || 1;
    const itemName = `${qty} ${item.name}`;
    const price = formatCurrency(item.price * qty);
    
    // Calculate number of spaces needed (target width is 42 chars)
    const spaces = 42 - itemName.length - price.length;
    
    return (
      <>
        {itemName}{' '.repeat(Math.max(1, spaces))}{price}
      </>
    );
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Receipt Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto flex justify-center">
        <div 
          ref={receiptRef}
          className={`border border-gray-200 p-4 text-xs whitespace-pre-wrap leading-tight receipt-font ${
            templateOptions.paperColor === 'default' 
              ? 'bg-gradient-to-br from-orange-50 to-gray-100' 
              : templateOptions.paperColor === 'white' 
                ? 'bg-white' 
                : templateOptions.paperColor === 'cream' 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50' 
                  : 'bg-gradient-to-br from-yellow-50 to-yellow-100'
          } ${
            templateOptions.textColor === 'black'
              ? 'text-black'
              : templateOptions.textColor === 'dark-gray'
                ? 'text-gray-800'
                : 'text-blue-950'
          }`}
          style={{ width: '300px', maxWidth: '100%', margin: '0 auto' }}
        >
          <div className="text-center mb-2">
            <div className="mb-1 flex justify-center">
              <img src={cvsLogo} alt={templateOptions.storeName || "CVS/pharmacy"} style={{ width: '220px', height: 'auto' }} className="mb-1" />
            </div>
            {templateOptions.storeAddress && (
              <div className="text-center text-xs mb-1">{templateOptions.storeAddress}</div>
            )}
            {templateOptions.storePhone && (
              <div className="text-center text-xs mb-1">{templateOptions.storePhone}</div>
            )}
          </div>
          
          <div className="mb-2 monospace">
            <div>REG#{receiptInfo.regNumber} TRN#{receiptInfo.transNumber} CSHR#{receiptInfo.cashierNumber}</div>
            <div>STR#{receiptInfo.storeNumber}</div>
            <div>HELPED BY: {receiptInfo.helperName}</div>
          </div>
          
          <div className="mb-2">
            {items.map((item, index) => (
              <div key={index} className="monospace">
                <div>{item.name}</div>
                <div>{item.sku}</div>
                <div className="flex">
                  <span style={{ flex: 1 }}></span>
                  <span>{formatCurrency(item.price * (item.quantity || 1))}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-2">
            <div className="monospace flex">
              <span>SUBTOTAL</span>
              <span style={{ flex: 1 }}></span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="monospace flex">
              <span>AR TAX {taxRate}%</span>
              <span style={{ flex: 1 }}></span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="monospace flex font-bold">
              <span>TOTAL</span>
              <span style={{ flex: 1 }}></span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="monospace flex">
              <span>*{receiptInfo.cardLastFour} DEBIT</span>
              <span style={{ flex: 1 }}></span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="monospace flex">
              <span>AID {receiptInfo.aidCode}</span>
              <span style={{ flex: 1 }}></span>
              <span>TOTAL PAYMENT</span>
            </div>
            <div className="monospace">US DEBIT</div>
          </div>
          
          <div className="mb-2 monospace">
            <div>
              # OF ITEMS SOLD {items.reduce((total, item) => total + (item.quantity || 1), 0)} {receiptInfo.date} {receiptInfo.time}
            </div>
          </div>
          
          {templateOptions.showBarcodeAtBottom && (
            <div className="text-center mb-2">
              <div className="mx-auto mb-1 flex justify-center">
                <Barcode
                  value={`${receiptInfo.randomNumbers[0]} ${receiptInfo.randomNumbers[1]} ${receiptInfo.randomNumbers[2]} ${receiptInfo.randomNumbers[3]}`}
                  width={0.8}
                  height={40}
                  fontSize={7}
                  margin={0}
                  displayValue={true}
                  fontOptions="bold"
                  font="OCR-A"
                />
              </div>
            </div>
          )}
          
          <div className="text-center mb-3">
            {templateOptions.footerText || 'RETURNS WITH RECEIPT THRU 6/29/2025'}
          </div>
          
          <div className="text-center">
            {receiptInfo.date}    {receiptInfo.time}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptPreview;
