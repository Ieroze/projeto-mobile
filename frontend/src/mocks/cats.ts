import { Cat } from '../types/cat';

export const mockCats: Cat[] = [
  {
    id: 'luna',
    name: 'Luna',
    ageLabel: '2 anos',
    sex: 'female',
    shortDescription: 'Dócil, brincalhona e muito carinhosa.',
    description:
      'Luna e dócil, brincalhona e adora carinho. Está em busca de um lar seguro e cheio de afeto.',
    adoptionStatus: 'available',
    careStatus: 'healthy',
    castrated: true,
    vaccinated: true,
    fivFelvNegative: true,
    traits: ['Carinhosa', 'Sociável', 'Brincalhona'],
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=900',
  },
  {
    id: 'thor',
    name: 'Thor',
    ageLabel: '1 ano',
    sex: 'male',
    shortDescription: 'Curioso e sociável.',
    description: 'Thor gosta de companhia e de explorar novos ambientes.',
    adoptionStatus: 'available',
    careStatus: 'temporary_home',
    castrated: true,
    vaccinated: true,
    traits: ['Curioso', 'Sociável'],
    imageUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=900',
  },
  {
    id: 'mel',
    name: 'Mel',
    ageLabel: '8 meses',
    sex: 'female',
    shortDescription: 'Em recuperação e muito tranquila.',
    description: 'Mel está em tratamento e ainda não está disponível para adoção.',
    adoptionStatus: 'not_available',
    careStatus: 'treatment',
    castrated: false,
    vaccinated: false,
    traits: ['Tranquila'],
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=900',
  },
];

let nextMockCatId = 1;

export function createMockCat(input: Omit<Cat, 'id'>): Cat {
  const cat = { ...input, id: `gdc-mock-cat-${nextMockCatId++}` };
  mockCats.push(cat);
  return cat;
}

export function updateMockCat(id: string, input: Omit<Cat, 'id'>): Cat | undefined {
  const index = mockCats.findIndex((cat) => cat.id === id);
  if (index < 0) return undefined;
  const cat = { ...input, imageUrl: mockCats[index].imageUrl, id };
  mockCats[index] = cat;
  return cat;
}

export function removeMockCat(id: string): boolean {
  const index = mockCats.findIndex((cat) => cat.id === id);
  if (index < 0) return false;
  mockCats.splice(index, 1);
  return true;
}
