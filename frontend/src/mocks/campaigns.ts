import { Campaign } from '../types/campaign';

export const mockCampaigns: Campaign[] = [
  {
    id: 'castracao-10',
    title: 'Castração de 10 gatinhos',
    description: 'Ajude a garantir mais saúde para os nossos gatinhos.',
    raisedCents: 85000,
    goalCents: 150000,
    daysRemaining: 25,
    pixKey: 'pix@gatosdacorte.org.br',
  },
  {
    id: 'tratamento-romeu',
    title: 'Tratamento do Romeu',
    description: 'Romeu precisa continuar o tratamento veterinário.',
    raisedCents: 32000,
    goalCents: 80000,
    daysRemaining: 18,
    pixKey: 'pix@gatosdacorte.org.br',
  },
];

let nextCampaignId = 1;
export function createMockCampaign(input: Omit<Campaign, 'id'>): Campaign {
  const item = { ...input, id: `gdc-mock-campaign-${nextCampaignId++}` };
  mockCampaigns.push(item);
  return item;
}
export function updateMockCampaign(id: string, input: Omit<Campaign, 'id'>): Campaign | undefined {
  const index = mockCampaigns.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  return (mockCampaigns[index] = { ...input, id });
}
export function removeMockCampaign(id: string): boolean {
  const index = mockCampaigns.findIndex((item) => item.id === id);
  if (index < 0) return false;
  mockCampaigns.splice(index, 1);
  return true;
}
