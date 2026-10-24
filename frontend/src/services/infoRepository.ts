import { mockInfoSections, updateMockInfoSection } from '../mocks/info';
import { InfoSection } from '../types/info';

export const infoRepository = {
  async list(): Promise<InfoSection[]> {
    return [...mockInfoSections];
  },
  async getById(id: string): Promise<InfoSection | undefined> { return mockInfoSections.find((item) => item.id === id); },
  async update(id: string, body: string): Promise<InfoSection> {
    const section = updateMockInfoSection(id, body);
    if (!section) throw new Error('INFO_SECTION_NOT_FOUND');
    return section;
  },
};
