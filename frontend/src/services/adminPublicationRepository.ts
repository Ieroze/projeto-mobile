import { createMockPublication, listMockPublications, removeMockPublication, updateMockPublication } from '../mocks/adminPublications';
import { AdminPublication } from '../types/adminPublication';

export const adminPublicationRepository = {
  async listForAdmin(): Promise<AdminPublication[]> { return listMockPublications(); },
  async listPublished(): Promise<AdminPublication[]> { return listMockPublications().filter((item) => item.status === 'published'); },
  async getForAdmin(id: string): Promise<AdminPublication | undefined> { return listMockPublications().find((item) => item.id === id); },
  async getPublished(id: string): Promise<AdminPublication | undefined> { return listMockPublications().find((item) => item.id === id && item.status === 'published'); },
  async create(input: Omit<AdminPublication, 'id'>): Promise<AdminPublication> { return createMockPublication(input); },
  async update(id: string, input: Omit<AdminPublication, 'id'>): Promise<AdminPublication> {
    const item = updateMockPublication(id, input);
    if (!item) throw new Error('PUBLICATION_NOT_FOUND');
    return item;
  },
  async remove(id: string): Promise<void> {
    if (!removeMockPublication(id)) throw new Error('PUBLICATION_NOT_FOUND');
  },
};
