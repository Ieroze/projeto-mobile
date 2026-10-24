import { ReceiptKind, ReceiptStatus } from '../types/adminReceipt';

// Andamento apenas em memória, separado dos protocolos e dos dados do formulário.
const statuses = new Map<string, ReceiptStatus>([
  ['adoption:GDC-ADOC-DEMO-0002', 'in_review'],
  ['adoption:GDC-ADOC-DEMO-0003', 'approved'],
  ['adoption:GDC-ADOC-DEMO-0004', 'rejected'],
  ['medication:GDC-MED-DEMO-0002', 'in_review'],
  ['medication:GDC-MED-DEMO-0003', 'approved'],
  ['medication:GDC-MED-DEMO-0004', 'rejected'],
]);
const keyFor = (kind: ReceiptKind, protocol: string) => `${kind}:${protocol}`;

export const mockAdminReceiptStatuses = {
  get(kind: ReceiptKind, protocol: string): ReceiptStatus {
    return statuses.get(keyFor(kind, protocol)) ?? 'pending';
  },
  set(kind: ReceiptKind, protocol: string, status: ReceiptStatus): void {
    statuses.set(keyFor(kind, protocol), status);
  },
};
