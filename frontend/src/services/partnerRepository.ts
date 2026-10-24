import { createMockPartner, mockPartners, removeMockPartner, updateMockPartner } from '../mocks/partners';
import { Partner } from '../types/partner';

export const partnerRepository = {
  async list(): Promise<Partner[]> {
    return [...mockPartners];
  },
  async getById(id: string): Promise<Partner | undefined> { return mockPartners.find((item) => item.id === id); },
  async create(input: Omit<Partner, 'id'>): Promise<Partner> { return createMockPartner(input); },
  async update(id: string, input: Omit<Partner, 'id'>): Promise<Partner> {
    const item = updateMockPartner(id, input);
    if (!item) throw new Error('PARTNER_NOT_FOUND');
    return item;
  },
  async remove(id: string): Promise<void> { if (!removeMockPartner(id)) throw new Error('PARTNER_NOT_FOUND'); },
};
