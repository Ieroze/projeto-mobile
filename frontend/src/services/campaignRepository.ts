import { createMockCampaign, mockCampaigns, removeMockCampaign, updateMockCampaign } from '../mocks/campaigns';
import { Campaign } from '../types/campaign';

export const campaignRepository = {
  async list(): Promise<Campaign[]> {
    return [...mockCampaigns];
  },

  async getById(id: string): Promise<Campaign | undefined> {
    return mockCampaigns.find((campaign) => campaign.id === id);
  },
  async create(input: Omit<Campaign, 'id'>): Promise<Campaign> { return createMockCampaign(input); },
  async update(id: string, input: Omit<Campaign, 'id'>): Promise<Campaign> {
    const item = updateMockCampaign(id, input);
    if (!item) throw new Error('CAMPAIGN_NOT_FOUND');
    return item;
  },
  async remove(id: string): Promise<void> {
    if (!removeMockCampaign(id)) throw new Error('CAMPAIGN_NOT_FOUND');
  },
};
