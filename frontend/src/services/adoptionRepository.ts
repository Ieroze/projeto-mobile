import { createMockApplicationReceipt, listMockApplicationReceipts } from '../mocks/adoptionApplications';
import { AdoptionApplicationInput, AdoptionApplicationReceipt } from '../types/adoption';
import { catRepository } from './catRepository';

export const adoptionRepository = {
  async listReceipts(): Promise<AdoptionApplicationReceipt[]> {
    return listMockApplicationReceipts();
  },

  async submit(input: AdoptionApplicationInput): Promise<AdoptionApplicationReceipt> {
    const cat = await catRepository.getById(input.catId);
    if (!cat || cat.adoptionStatus !== 'available') {
      throw new Error('CAT_NOT_AVAILABLE');
    }
    // Simulação local: nenhum dado pessoal é enviado ou persistido.
    return createMockApplicationReceipt(input.catId);
  },
};
