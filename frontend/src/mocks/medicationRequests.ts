import { MedicationRequestReceipt } from '../types/medication';

let nextMockProtocol = 1;
// Protocolos fictícios para exercitar a fila administrativa desde a abertura do app.
const mockReceipts: MedicationRequestReceipt[] = [
  { protocol: 'GDC-MED-DEMO-0001', attachmentCount: 2 },
  { protocol: 'GDC-MED-DEMO-0002', attachmentCount: 1 },
  { protocol: 'GDC-MED-DEMO-0003', attachmentCount: 0 },
  { protocol: 'GDC-MED-DEMO-0004', attachmentCount: 1 },
];

export function createMockMedicationReceipt(attachmentCount: number): MedicationRequestReceipt {
  const sequence = String(nextMockProtocol++).padStart(4, '0');
  const receipt = { protocol: `GDC-MED-MOCK-${Date.now()}-${sequence}`, attachmentCount };
  // Apenas o protocolo e a contagem ficam em memória nesta sessão.
  mockReceipts.push(receipt);
  return receipt;
}

export function listMockMedicationReceipts(): MedicationRequestReceipt[] {
  return [...mockReceipts];
}
