import { Partner } from '../types/partner';

// Substituir pelos nomes e perfis confirmados pela ONG antes de publicar.
export const mockPartners: Partner[] = [
  {
    id: 'accounting-demo',
    name: 'Parceiro de contabilidade',
    category: 'accounting',
    description: 'Apoio contábil à organização e aos projetos da ONG.',
    socials: [{ platform: 'instagram', label: 'Instagram a cadastrar' }],
    isDemo: true,
  },
  {
    id: 'veterinary-demo',
    name: 'Parceiro veterinário',
    category: 'veterinary',
    description: 'Cuidado e orientação para a saúde dos gatos.',
    socials: [
      { platform: 'instagram', label: 'Instagram a cadastrar' },
      { platform: 'website', label: 'Site a cadastrar' },
    ],
    isDemo: true,
  },
  {
    id: 'photography-demo',
    name: 'Parceiro de fotografia',
    category: 'photography',
    description: 'Registros que ajudam a contar a história de cada gato.',
    socials: [{ platform: 'instagram', label: 'Instagram a cadastrar' }],
    isDemo: true,
  },
];

let nextPartnerId = 1;
export function createMockPartner(input: Omit<Partner, 'id'>): Partner {
  const item = { ...input, id: `gdc-mock-partner-${nextPartnerId++}` };
  mockPartners.push(item);
  return item;
}
export function updateMockPartner(id: string, input: Omit<Partner, 'id'>): Partner | undefined {
  const index = mockPartners.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  return (mockPartners[index] = { ...input, id });
}
export function removeMockPartner(id: string): boolean {
  const index = mockPartners.findIndex((item) => item.id === id);
  if (index < 0) return false;
  mockPartners.splice(index, 1);
  return true;
}
