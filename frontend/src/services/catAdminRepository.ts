import { mockCatAdmin } from '../mocks/catAdmin';
import { CatHealthRecord, CatHealthRecordDraft, CatPhoto, CatPhotoDraft } from '../types/catAdmin';
import { catRepository } from './catRepository';

async function requireCat(catId: string) {
  if (!await catRepository.getById(catId)) throw new Error('CAT_NOT_FOUND');
}

export const catAdminRepository = {
  async listPhotos(catId: string): Promise<CatPhoto[]> { await requireCat(catId); return [...mockCatAdmin.listPhotos(catId)]; },
  async addPhoto(catId: string, draft: CatPhotoDraft): Promise<CatPhoto> { await requireCat(catId); return mockCatAdmin.addPhoto(catId, draft); },
  async updatePhoto(catId: string, id: string, draft: CatPhotoDraft): Promise<CatPhoto> {
    const item = mockCatAdmin.updatePhoto(catId, id, draft);
    if (!item) throw new Error('PHOTO_NOT_FOUND');
    return item;
  },
  async setCover(catId: string, id: string): Promise<void> { if (!mockCatAdmin.setCover(catId, id)) throw new Error('PHOTO_NOT_FOUND'); },
  async removePhoto(catId: string, id: string): Promise<void> { if (!mockCatAdmin.removePhoto(catId, id)) throw new Error('PHOTO_NOT_FOUND'); },
  async listRecords(catId: string): Promise<CatHealthRecord[]> { await requireCat(catId); return [...mockCatAdmin.listRecords(catId)]; },
  async addRecord(catId: string, draft: CatHealthRecordDraft): Promise<CatHealthRecord> { await requireCat(catId); return mockCatAdmin.addRecord(catId, draft); },
  async updateRecord(catId: string, id: string, draft: CatHealthRecordDraft): Promise<CatHealthRecord> {
    const item = mockCatAdmin.updateRecord(catId, id, draft);
    if (!item) throw new Error('RECORD_NOT_FOUND');
    return item;
  },
  async removeRecord(catId: string, id: string): Promise<void> { if (!mockCatAdmin.removeRecord(catId, id)) throw new Error('RECORD_NOT_FOUND'); },
};
