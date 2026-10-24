import { AdoptionApplicationReceipt } from '../types/adoption';

let nextMockProtocol = 1;
// Protocolos fictícios para exercitar a fila administrativa desde a abertura do app.
const mockReceipts: AdoptionApplicationReceipt[] = [
  { protocol: 'GDC-ADOC-DEMO-0001', catId: 'thor' },
  { protocol: 'GDC-ADOC-DEMO-0002', catId: 'thor' },
  { protocol: 'GDC-ADOC-DEMO-0003', catId: 'thor' },
  { protocol: 'GDC-ADOC-DEMO-0004', catId: 'thor' },
];

export function createMockApplicationReceipt(catId: string): AdoptionApplicationReceipt {
  const sequence = String(nextMockProtocol++).padStart(4, '0');
  const receipt = { catId, protocol: `GDC-MOCK-${Date.now()}-${sequence}` };
  // Guarda apenas a referência nesta sessão para a futura lista administrativa mockada.
  // Dados pessoais do formulário não são armazenados.
  mockReceipts.push(receipt);
  return receipt;
}

export function listMockApplicationReceipts(): AdoptionApplicationReceipt[] {
  return [...mockReceipts];
}
