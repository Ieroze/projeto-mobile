import { listMockApplicationReceipts } from '../mocks/adoptionApplications';
import { mockCatAdmin } from '../mocks/catAdmin';
import { createMockCat, mockCats, removeMockCat, updateMockCat } from '../mocks/cats';
import { Cat, CatDraft } from '../types/cat';

// Repository temporario. Quando a API estiver pronta, troque a implementacao
// sem obrigar as telas a conhecerem detalhes de HTTP.
export const catRepository = {
  async list(): Promise<Cat[]> {
    return [...mockCats];
  },

  async getById(id: string): Promise<Cat | undefined> {
    return mockCats.find((cat) => cat.id === id);
  },

  async create(input: CatDraft): Promise<Cat> {
    const cat = createMockCat({ ...input, imageUrl: undefined });
    if (input.imageUrl) mockCatAdmin.addPhoto(cat.id, { url: input.imageUrl, altText: `Foto de ${cat.name}` });
    return cat;
  },

  async update(id: string, input: CatDraft): Promise<Cat> {
    const cat = updateMockCat(id, input);
    if (!cat) throw new Error('CAT_NOT_FOUND');
    return cat;
  },

  async remove(id: string): Promise<void> {
    if (listMockApplicationReceipts().some((receipt) => receipt.catId === id)) throw new Error('CAT_HAS_ADOPTION_RECEIPTS');
    if (!removeMockCat(id)) throw new Error('CAT_NOT_FOUND');
    mockCatAdmin.removeAll(id);
  },
};
