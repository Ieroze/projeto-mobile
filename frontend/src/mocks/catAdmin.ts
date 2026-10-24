import { CatHealthRecord, CatHealthRecordDraft, CatPhoto, CatPhotoDraft } from '../types/catAdmin';
import { mockCats } from './cats';

const photos: CatPhoto[] = mockCats.flatMap((cat) => cat.imageUrl ? [{ id: `cover-${cat.id}`, catId: cat.id, url: cat.imageUrl, altText: `Foto de ${cat.name}`, isCover: true }] : []);
const records: CatHealthRecord[] = [];
let nextPhotoId = 1;
let nextRecordId = 1;

export const mockCatAdmin = {
  listPhotos(catId: string) { return photos.filter((item) => item.catId === catId); },
  addPhoto(catId: string, draft: CatPhotoDraft) {
    const item: CatPhoto = { ...draft, catId, id: `gdc-mock-photo-${nextPhotoId++}`, isCover: !photos.some((photo) => photo.catId === catId) };
    photos.push(item);
    if (item.isCover) { const cat = mockCats.find((value) => value.id === catId); if (cat) cat.imageUrl = item.url; }
    return item;
  },
  updatePhoto(catId: string, id: string, draft: CatPhotoDraft) {
    const item = photos.find((photo) => photo.catId === catId && photo.id === id);
    if (!item) return undefined;
    Object.assign(item, draft);
    if (item.isCover) { const cat = mockCats.find((value) => value.id === catId); if (cat) cat.imageUrl = item.url; }
    return item;
  },
  setCover(catId: string, id: string) {
    const selected = photos.find((photo) => photo.catId === catId && photo.id === id);
    if (!selected) return false;
    photos.forEach((photo) => { if (photo.catId === catId) photo.isCover = photo.id === id; });
    const cat = mockCats.find((value) => value.id === catId);
    if (cat) cat.imageUrl = selected.url;
    return true;
  },
  removePhoto(catId: string, id: string) {
    const index = photos.findIndex((photo) => photo.catId === catId && photo.id === id);
    if (index < 0) return false;
    const wasCover = photos[index].isCover;
    photos.splice(index, 1);
    if (wasCover) {
      const next = photos.find((photo) => photo.catId === catId);
      if (next) next.isCover = true;
      const cat = mockCats.find((value) => value.id === catId);
      if (cat) cat.imageUrl = next?.url;
    }
    return true;
  },
  listRecords(catId: string) { return records.filter((item) => item.catId === catId); },
  addRecord(catId: string, draft: CatHealthRecordDraft) {
    const item = { ...draft, catId, id: `gdc-mock-health-${nextRecordId++}` };
    records.push(item);
    return item;
  },
  updateRecord(catId: string, id: string, draft: CatHealthRecordDraft) {
    const index = records.findIndex((item) => item.catId === catId && item.id === id);
    if (index < 0) return undefined;
    return (records[index] = { ...draft, catId, id });
  },
  removeRecord(catId: string, id: string) {
    const index = records.findIndex((item) => item.catId === catId && item.id === id);
    if (index < 0) return false;
    records.splice(index, 1);
    return true;
  },
  removeAll(catId: string) {
    for (let i = photos.length - 1; i >= 0; i--) if (photos[i].catId === catId) photos.splice(i, 1);
    for (let i = records.length - 1; i >= 0; i--) if (records[i].catId === catId) records.splice(i, 1);
  },
};
