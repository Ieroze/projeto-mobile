import { GuideArticle, GuideCategory } from '../types/guide';

export const mockGuideCategories: GuideCategory[] = [
  { id: 'ambiente-adaptacao', name: 'Ambiente e adaptação' },
  { id: 'alimentacao-hidratacao', name: 'Alimentação e hidratação' },
];

export const mockGuideArticles: GuideArticle[] = [
  {
    id: 'ambiente-adaptacao',
    categoryId: 'ambiente-adaptacao',
    title: 'Preparando a casa para receber um gato',
    summary: 'Organize um ambiente seguro para os primeiros dias.',
    body: 'Este artigo é demonstrativo. As orientações sobre adaptação da casa serão publicadas após revisão da ONG.',
  },
  {
    id: 'alimentacao',
    categoryId: 'alimentacao-hidratacao',
    title: 'Rotina de alimentação e água',
    summary: 'Cuidados básicos para manter uma rotina adequada.',
    body: 'Este artigo é demonstrativo. As orientações sobre alimentação e hidratação serão publicadas após revisão da ONG.',
  },
];

let nextArticleId = 1;
let nextCategoryId = 1;
export function createMockArticle(input: Omit<GuideArticle, 'id'>): GuideArticle {
  const item = { ...input, id: `gdc-mock-article-${nextArticleId++}` };
  mockGuideArticles.push(item);
  return item;
}
export function updateMockArticle(id: string, input: Omit<GuideArticle, 'id'>): GuideArticle | undefined {
  const index = mockGuideArticles.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  return (mockGuideArticles[index] = { ...input, id });
}
export function removeMockArticle(id: string): boolean {
  const index = mockGuideArticles.findIndex((item) => item.id === id);
  if (index < 0) return false;
  mockGuideArticles.splice(index, 1);
  return true;
}
export function createMockCategory(name: string): GuideCategory {
  if (mockGuideCategories.some((item) => item.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) throw new Error('CATEGORY_NAME_EXISTS');
  const item = { name, id: `gdc-mock-category-${nextCategoryId++}` };
  mockGuideCategories.push(item);
  return item;
}
export function updateMockCategory(id: string, name: string): GuideCategory | undefined {
  if (mockGuideCategories.some((item) => item.id !== id && item.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) throw new Error('CATEGORY_NAME_EXISTS');
  const item = mockGuideCategories.find((category) => category.id === id);
  if (!item) return undefined;
  item.name = name;
  return item;
}
export function removeMockCategory(id: string): boolean {
  if (mockGuideArticles.some((item) => item.categoryId === id)) return false;
  const index = mockGuideCategories.findIndex((item) => item.id === id);
  if (index < 0) return false;
  mockGuideCategories.splice(index, 1);
  return true;
}
