import { AdminPublication } from '../types/adminPublication';

const publications: AdminPublication[] = [
  {
    id: 'exemplo-mutirao',
    title: 'Exemplo: mutirão de cuidados',
    body: 'Esta publicação é fictícia. Em um aviso real, a equipe pode informar ações de cuidado, necessidades dos gatos e formas de participação da comunidade.',
    status: 'published',
  },
  {
    id: 'exemplo-visitas',
    title: 'Exemplo: visitas para adoção',
    body: 'Este aviso é apenas uma demonstração. Aqui a ONG poderá orientar interessados sobre como conhecer os gatos e iniciar uma adoção responsável.',
    status: 'published',
  },
  {
    id: 'exemplo-doacoes',
    title: 'Exemplo: itens necessários',
    body: 'Conteúdo fictício para visualizar a área pública. Uma publicação futura pode listar materiais de higiene, alimentação ou outros itens confirmados pela ONG.',
    status: 'published',
  },
  {
    id: 'exemplo-rascunho',
    title: 'Exemplo: aviso em preparação',
    body: 'Este rascunho fictício aparece apenas na gestão administrativa até ser marcado como Publicado.',
    status: 'draft',
  },
];
let nextId = 1;

export function listMockPublications(): AdminPublication[] {
  return publications.map((item) => ({ ...item }));
}

export function createMockPublication(input: Omit<AdminPublication, 'id'>): AdminPublication {
  const item = { ...input, id: `gdc-mock-publication-${nextId++}` };
  publications.unshift(item);
  return { ...item };
}

export function updateMockPublication(id: string, input: Omit<AdminPublication, 'id'>): AdminPublication | undefined {
  const index = publications.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  publications[index] = { ...input, id };
  return { ...publications[index] };
}

export function removeMockPublication(id: string): boolean {
  const index = publications.findIndex((item) => item.id === id);
  if (index < 0) return false;
  publications.splice(index, 1);
  return true;
}
