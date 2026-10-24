export interface CatPhotoDraft { url: string; altText: string }
export interface CatPhoto extends CatPhotoDraft { id: string; catId: string; isCover: boolean }

export interface CatHealthRecordDraft {
  recordType: string;
  title: string;
  notes: string;
  occurredOn: string;
  nextDueOn: string;
}
export interface CatHealthRecord extends CatHealthRecordDraft { id: string; catId: string }
