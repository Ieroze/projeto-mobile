export interface GuideCategory {
  id: string;
  name: string;
}

export interface GuideArticle {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  body: string;
}
