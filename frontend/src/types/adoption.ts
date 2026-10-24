// Modelo do app para o futuro POST /adoption-applications.
// O formato JSON definitivo será alinhado com o backend antes da integração.
export type HousingType = 'house' | 'apartment' | 'other';

export interface AdoptionApplicationInput {
  catId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  city?: string;
  housingType?: HousingType;
  hasOtherAnimals?: boolean;
  adoptionReasons?: string;
  consentPrivacy: true;
}

export interface AdoptionApplicationReceipt {
  protocol: string;
  catId: string;
}
