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
}

const ReceiptPreview = ({ items, receiptInfo, taxRate }: ReceiptPreviewProps) => {
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
          className="bg-gradient-to-br from-orange-50 to-gray-100 border border-gray-200 p-4 max-w-sm font-mono text-xs whitespace-pre-wrap leading-tight text-black"
          style={{ width: '320px', fontFamily: 'Courier, monospace' }}
        >
          <div className="text-center mb-2">
            <div className="mb-1 flex justify-center">
              <img src={cvsLogo} alt="CVS/pharmacy" style={{ width: '250px', height: 'auto' }} />
            </div>
          </div>
          
          <div className="mb-3">
            <div>REG#{receiptInfo.regNumber} TRN#{receiptInfo.transNumber} CSHR#{receiptInfo.cashierNumber} STR#{receiptInfo.storeNumber}</div>
            <div>HELPED BY: {receiptInfo.helperName}</div>
          </div>
          
          <div className="mb-3">
            {items.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="flex-none" style={{ fontFamily: 'Courier, monospace', color: '#000000' }}>
                  {formatItemLine(item)}
                </div>
                <div className="ml-2" style={{ fontFamily: 'Courier, monospace', color: '#000000' }}>
                  {item.sku}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-3">
            <div className="text-right" style={{ fontFamily: 'Courier, monospace' }}>
              SUBTOTAL{' '.repeat(16)}{formatCurrency(subtotal)}
            </div>
            <div className="text-right" style={{ fontFamily: 'Courier, monospace' }}>
              AR TAX {taxRate}%{' '.repeat(10)}{formatCurrency(tax)}
            </div>
            <div className="text-right font-bold" style={{ fontFamily: 'Courier, monospace' }}>
              TOTAL{' '.repeat(19)}{formatCurrency(total)}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between" style={{ fontFamily: 'Courier, monospace' }}>
              <span>*{receiptInfo.cardLastFour} DEBIT</span>
              <span>TOTAL PAYMENT</span>
            </div>
            <div>AID {receiptInfo.aidCode}</div>
            <div>US DEBIT</div>
          </div>
          
          <div className="mb-3">
            <div style={{ fontFamily: 'Courier, monospace' }}>
              # OF ITEMS SOLD {items.reduce((total, item) => total + (item.quantity || 1), 0)}    {receiptInfo.date}    {receiptInfo.time}
            </div>
          </div>
          
          <div className="text-center mb-2">
            <div className="mx-auto mb-1 flex justify-center">
              <Barcode
                value={`${receiptInfo.randomNumbers[0]} ${receiptInfo.randomNumbers[1]} ${receiptInfo.randomNumbers[2]} ${receiptInfo.randomNumbers[3]}`}
                width={1}
                height={40}
                fontSize={8}
                margin={0}
                displayValue={true}
              />
            </div>
          </div>
          
          <div className="text-center mb-3">
            RETURNS WITH RECEIPT THRU 6/29/2025
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
