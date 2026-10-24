import { createMockMedicationReceipt, listMockMedicationReceipts } from '../mocks/medicationRequests';
import { MedicationRequestInput, MedicationRequestReceipt } from '../types/medication';

export const medicationRepository = {
  async submit(input: MedicationRequestInput): Promise<MedicationRequestReceipt> {
    // Simulação local: não lê, envia ou persiste os arquivos nem os dados pessoais.
    return createMockMedicationReceipt(input.attachments.length);
  },

  async listReceipts(): Promise<MedicationRequestReceipt[]> {
    return listMockMedicationReceipts();
  },
};
