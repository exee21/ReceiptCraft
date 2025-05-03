import { format } from 'date-fns';
import { FormattedDate, HelperInfo, ReceiptInfo } from '@/types';

// List of common American female names
export const americanFemaleNames = [
  "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Charlotte", "Mia", "Amelia", 
  "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Mila", "Ella", "Avery", 
  "Sofia", "Camila", "Aria", "Scarlett", "Victoria", "Madison", "Luna", "Grace", 
  "Chloe", "Penelope", "Layla", "Riley", "Zoey", "Nora", "Lily", "Eleanor", 
  "Hannah", "Lillian", "Addison", "Aubrey", "Ellie", "Stella", "Natalie", "Zoe", 
  "Leah", "Hazel", "Violet", "Aurora", "Savannah", "Audrey", "Brooklyn", "Bella"
];

// Format currency
export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

// Generate random number between min and max (inclusive)
export const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate random digits of specified length
export const generateRandomDigits = (length: number): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
};

// Calculate subtotal, tax, and total
export const calculateTotals = (items: { price: number }[], taxRate: number) => {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price.toString()), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total
  };
};

// Generate random helper information (name and ID)
export const generateRandomHelperInfo = (): HelperInfo => {
  const nameIndex = Math.floor(Math.random() * americanFemaleNames.length);
  const name = americanFemaleNames[nameIndex].toUpperCase();
  const id = generateRandomDigits(7);
  return { name, id };
};

// Generate receipt information
export const generateReceiptInfo = (): ReceiptInfo => {
  const helper = generateRandomHelperInfo();
  const regNumber = generateRandomNumber(2, 24).toString().padStart(2, '0');
  const transNumber = '0' + generateRandomDigits(3);
  const cardLastFour = generateRandomDigits(4);
  const randomNumbers = [
    generateRandomDigits(4),
    generateRandomDigits(4),
    generateRandomDigits(4),
    generateRandomDigits(4)
  ];
  const authCode = generateRandomDigits(6);
  const aidCode = 'A000000003101' + generateRandomDigits(1);
  
  const now = new Date();
  const date = format(now, 'MM/dd/yyyy');
  const time = format(now, 'hh:mm a');
  
  return {
    regNumber,
    transNumber,
    cashierNumber: '0' + helper.id,
    storeNumber: '9562',
    cardLastFour,
    authCode,
    aidCode,
    randomNumbers,
    helperName: helper.name,
    date,
    time
  };
};

// Format date and time for receipt
export const getFormattedDateTime = (): FormattedDate => {
  const now = new Date();
  return {
    date: format(now, 'yyyy-MM-dd'),
    time: format(now, 'HH:mm')
  };
};

// Generate HTML for printing
export const generatePrintHTML = (receiptHTML: string): string => {
  return `
    <html>
      <head>
        <title>CVS Receipt</title>
        <style>
          @page {
            margin: 0;
            size: 80mm 297mm;
          }
          body { 
            font-family: 'Courier', monospace; 
            font-size: 12px; 
            margin: 5mm; 
            background-color: white;
            color: black;
          }
          .receipt { 
            width: 70mm; 
            margin: 0 auto; 
            padding: 0;
            background-color: white;
          }
          img { max-width: 100%; }
          .center { text-align: center; }
          .divider { border-top: 1px solid #ddd; margin: 8px 0; }
          .flex { display: flex; justify-content: space-between; }
          .ml { margin-left: 16px; }
          .mb { margin-bottom: 4px; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="receipt">
          ${receiptHTML}
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;
};
