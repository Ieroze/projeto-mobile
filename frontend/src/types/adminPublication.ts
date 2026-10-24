export interface AdminPublication {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'published';
}
