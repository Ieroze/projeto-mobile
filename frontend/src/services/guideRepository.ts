import { createMockArticle, createMockCategory, mockGuideArticles, mockGuideCategories, removeMockArticle, removeMockCategory, updateMockArticle, updateMockCategory } from '../mocks/guide';
import { GuideArticle, GuideCategory } from '../types/guide';

export const guideRepository = {
  async listCategories(): Promise<GuideCategory[]> {
    return [...mockGuideCategories];
  },

  async listArticles(): Promise<GuideArticle[]> {
    return [...mockGuideArticles];
  },

  async getArticleById(id: string): Promise<GuideArticle | undefined> {
    return mockGuideArticles.find((article) => article.id === id);
  },
  async getCategoryById(id: string): Promise<GuideCategory | undefined> { return mockGuideCategories.find((item) => item.id === id); },
  async createArticle(input: Omit<GuideArticle, 'id'>): Promise<GuideArticle> { return createMockArticle(input); },
  async updateArticle(id: string, input: Omit<GuideArticle, 'id'>): Promise<GuideArticle> {
    const item = updateMockArticle(id, input);
    if (!item) throw new Error('ARTICLE_NOT_FOUND');
    return item;
  },
  async removeArticle(id: string): Promise<void> { if (!removeMockArticle(id)) throw new Error('ARTICLE_NOT_FOUND'); },
  async createCategory(name: string): Promise<GuideCategory> { return createMockCategory(name); },
  async updateCategory(id: string, name: string): Promise<GuideCategory> {
    const item = updateMockCategory(id, name);
    if (!item) throw new Error('CATEGORY_NOT_FOUND');
    return item;
  },
  async removeCategory(id: string): Promise<void> {
    if (!removeMockCategory(id)) throw new Error('CATEGORY_IN_USE_OR_NOT_FOUND');
  },
};
