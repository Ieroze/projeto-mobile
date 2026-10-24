export type Sex = 'female' | 'male';
export type AdoptionStatus = 'available' | 'in_process' | 'adopted' | 'not_available';
export type CareStatus = 'healthy' | 'treatment' | 'temporary_home';

export interface Cat {
  id: string;
  name: string;
  ageLabel: string;
  sex: Sex;
  shortDescription: string;
  description: string;
  adoptionStatus: AdoptionStatus;
  careStatus: CareStatus;
  castrated: boolean;
  vaccinated: boolean;
  fivFelvNegative?: boolean;
  traits: string[];
  imageUrl?: string;
}

export type CatDraft = Omit<Cat, 'id'>;
