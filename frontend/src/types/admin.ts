import { ReceiptStatusCounts } from './adminReceipt';

export interface AdminSession {
  email: string;
  name: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminOverview {
  cats: number;
  availableCats: number;
  campaigns: number;
  articles: number;
  adoptionReceipts: number;
  medicationReceipts: number;
  adoptionByStatus: ReceiptStatusCounts;
  medicationByStatus: ReceiptStatusCounts;
}
