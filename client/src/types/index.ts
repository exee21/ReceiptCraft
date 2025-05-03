export interface ReceiptItem {
  id?: number;
  name: string;
  price: number;
  sku: string;
  receiptId?: number;
}

export interface ReceiptDetails {
  id?: number;
  date: string;
  time: string;
  taxRate: number;
  regNumber: string;
  transNumber: string;
  helperName: string;
  cashierNumber: string;
  storeNumber: string;
  cardLastFour: string;
  authCode: string;
  aidCode: string;
  randomNumbers: string[];
}

export interface FormattedDate {
  date: string;
  time: string;
}

export interface HelperInfo {
  name: string;
  id: string;
}

export interface ReceiptInfo {
  regNumber: string;
  transNumber: string;
  cashierNumber: string;
  storeNumber: string;
  cardLastFour: string;
  authCode: string;
  aidCode: string;
  randomNumbers: string[];
  date: string;
  time: string;
  helperName: string;
}
