import { InfoSection } from '../types/info';

export const mockInfoSections: InfoSection[] = [
  {
    id: 'help',
    title: 'Como ajudar',
    body: 'Conheça os gatos disponíveis para adoção responsável e acompanhe as campanhas de cuidado.',
    actions: [
      { label: 'Ver gatos', route: 'Cats' },
      { label: 'Ver campanhas', route: 'Campaigns' },
    ],
  },
  {
    id: 'about',
    title: 'Sobre a Gatos da Corte',
    body: 'Este aplicativo reúne informações sobre gatos, campanhas e conteúdos do Guia do Felino para apoiar a adoção e o cuidado responsável.',
  },
  {
    id: 'contact',
    title: 'Contato',
    body: 'Os canais oficiais de contato serão exibidos aqui quando forem confirmados pela ONG.',
  },
  {
    id: 'privacy',
    title: 'Privacidade',
    body: 'A manifestação de interesse é uma simulação: os dados informados não são enviados à ONG nem salvos no dispositivo. A política de privacidade será disponibilizada antes do envio real de dados.',
  },
];

export function updateMockInfoSection(id: string, body: string): InfoSection | undefined {
  const section = mockInfoSections.find((item) => item.id === id);
  if (!section) return undefined;
  section.body = body;
  return section;
}
