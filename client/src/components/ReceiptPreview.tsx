import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReceiptItem, ReceiptInfo } from '@/types';
import { formatCurrency } from '@/lib/receiptUtils';
import Barcode from 'react-barcode';

interface ReceiptPreviewProps {
  items: ReceiptItem[];
  receiptInfo: ReceiptInfo;
  taxRate: number;
}

const ReceiptPreview = ({ items, receiptInfo, taxRate }: ReceiptPreviewProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  
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
          className="bg-white border border-gray-200 p-4 max-w-sm font-mono text-sm whitespace-pre-wrap leading-tight"
        >
          <div className="flex justify-center mb-3">
            <svg viewBox="0 0 300 50" xmlns="http://www.w3.org/2000/svg" className="h-8">
              <path d="M116.5 5.5c-8.6 2.3-15.8 8.8-19.1 17.2-2.5 6.2-2.4 15.4.1 22 5.1 12.8 18.8 20.6 32.5 18.3 22.7-3.8 33.7-30.7 20.6-50-4.9-7.3-12-11.9-19.7-12.8-1.9-.2-4-.5-4.7-.5-3.8-.3-6.3.1-9.7 1.8z" fill="#000"/>
              <path d="M168.5 11c-4.4 2.2-8.9 6.8-10.8 11-3.2 7-2.3 17.4 2.2 23 3.5 4.4 11.6 9.1 16.1 9.2 4.1.1 4.6-1.7 1.1-3.8-10.9-6.8-15.8-20.3-10.6-29.2 3.2-5.5 10.5-8.5 15.7-6.5 3.1 1.2 7.3 5.1 8.9 8.4 1.8 3.7 2.1 13.2.5 17-2.4 5.9-9.1 9.9-15.8 9.9-4.8 0-5.7 1.2-2.3 3 4.2 2.2 13.8 1.1 18.3-2.2 7.3-5.5 10.3-17.3 6.8-26.5-2.2-5.7-8-11.2-13.7-13-4.9-1.4-12.8-.9-16.4 1.7z" fill="#000"/>
              <path d="M53.4 15.5c-7.8 2.6-13.5 8-16.9 16.3-2.5 6-2.5 16.4 0 22.9 3.6 9.5 13.5 17.3 23.3 18.3 10.4 1.1 21.2-3.8 27.2-12.4 2.2-3.1 2.4-4.1 1.8-6.6-.9-3.6-2.4-4.4-4.6-2.4-1.9 1.8-7.6 3.9-12.2 4.6-10.3 1.5-20.5-5.5-24.1-16.6-3.1-9.5 2.2-21.5 11.5-25.8 3.7-1.7 5.1-1.9 10.1-1 6.9 1.2 11.5 4.2 14.9 9.7 1.8 2.9 1.9 2.9 3.5.9 4.2-5.2.3-14.3-7.9-18.4-5.1-2.5-18.4-2.1-26.6.5z" fill="#000"/>
              <path d="M231.5 27.7c-1.1.5-2.3 1.5-2.7 2.3-.5 1-.8 19.3-.8 49.5 0 41.9.2 48.6 1.5 51.5 2.5 5.4 8.3 8.2 18.2 9 6.5.5 12.3-.3 12.3-1.8 0-.6-2.5-1.8-5.5-2.7-8.3-2.4-8.7-4.3-8.5-38.5l.2-29 3.9-4c4.7-4.7 11.3-7.5 17.9-7.5 2.2 0 4.3-.5 4.6-1 .9-1.5-3.3-9.8-6.6-13-4.1-4-7.9-5.2-16.5-5.2-8.9 0-12.9 1.7-17.9 7.5l-3.9 4.7-.1-9.3c-.1-10.7-1.2-14.2-5.1-16.3-3.1-1.6-6.9-1.2-10 .8z" fill="#000"/>
            </svg>
          </div>
          <div className="text-center mb-3">
            <div className="text-xs">2015 Fayetteville Rd, VAN BUREN, AR 72956</div>
            <div className="text-xs">(479)471-1608</div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="my-2">
            {items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
                <div className="text-xs ml-4">
                  SKU: {item.sku}
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex justify-between text-xs">
            <span>SUBTOTAL</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>TAX</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-xs">
            <span>TOTAL</span>
            <span>{formatCurrency(total)}</span>
          </div>
          
          <Separator className="my-2" />
          
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>DEBIT CARD</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div>ACCOUNT: XXXX XXXX XXXX {receiptInfo.cardLastFour}</div>
            <div className="flex justify-between">
              <span>AUTH CODE:</span>
              <span>{receiptInfo.authCode}</span>
            </div>
            <div className="flex justify-between">
              <span>AID:</span>
              <span>{receiptInfo.aidCode}</span>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="text-xs mb-1">
            <div>HELPED BY: {receiptInfo.helperName}</div>
            <div>
              <span>REG#{receiptInfo.regNumber}</span>
              <span className="ml-2">TRN#{receiptInfo.transNumber}</span>
              <span className="ml-2">CSHR#{receiptInfo.cashierNumber}</span>
            </div>
            <div>STR#{receiptInfo.storeNumber}</div>
          </div>
          
          <Separator className="my-2" />
          
          <div className="text-center text-xs mb-2">
            <div>{receiptInfo.date} {receiptInfo.time}</div>
            <div className="mt-1 flex justify-center space-x-1">
              {receiptInfo.randomNumbers.map((num, i) => (
                <span key={i}>{num}</span>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-4">
            <div className="mx-auto mb-1 flex justify-center">
              <Barcode
                value={`CVS-${receiptInfo.storeNumber}-${receiptInfo.regNumber}-${receiptInfo.transNumber}`}
                width={1.5}
                height={30}
                fontSize={10}
                margin={0}
                displayValue={false}
              />
            </div>
            <div className="text-[10px]">*BARCODE SCAN*</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptPreview;
