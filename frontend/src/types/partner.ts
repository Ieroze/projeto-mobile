export type PartnerCategory = 'accounting' | 'veterinary' | 'photography';
export type PartnerSocialPlatform = 'instagram' | 'facebook' | 'whatsapp' | 'website';

export interface PartnerSocial {
  platform: PartnerSocialPlatform;
  label: string;
  url?: string;
}

export interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  description: string;
  socials: PartnerSocial[];
  isDemo?: boolean;
}
