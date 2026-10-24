export type ReceiptKind = 'adoption' | 'medication';
export type ReceiptSource = 'session' | 'demo' | 'example';
export const receiptStatuses = ['pending', 'in_review', 'approved', 'rejected'] as const;
export type ReceiptStatus = typeof receiptStatuses[number];
export type ReceiptStatusCounts = Record<ReceiptStatus, number>;

export interface ReceiptField {
  label: string;
  value: string;
}

export interface ReceiptSection {
  title: string;
  fields: ReceiptField[];
}

export interface AdminReceiptItem {
  protocol: string;
  kind: ReceiptKind;
  source: ReceiptSource;
  status: ReceiptStatus;
  summary: string;
  sections: ReceiptSection[];
}
