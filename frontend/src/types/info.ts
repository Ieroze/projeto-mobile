export type InfoActionRoute = 'Cats' | 'Campaigns';

export interface InfoAction {
  label: string;
  route: InfoActionRoute;
}

export interface InfoSection {
  id: string;
  title: string;
  body: string;
  actions?: InfoAction[];
}
