import { ReceiptStatus } from './adminReceipt';
import { Campaign } from './campaign';
import { CatDraft } from './cat';
import { GuideArticle } from './guide';

export type RootStackParamList = {
  MainTabs: undefined;
  CampaignDetails: { campaignId: string };
  CatDetails: { catId: string };
  AdoptionForm: { catId: string };
  AdoptionSuccess: { catId: string; catName: string; protocol: string };
  GuideArticle: { articleId: string };
  Partners: undefined;
  Settings: undefined;
  MedicationForm: undefined;
  MedicationSuccess: { protocol: string; attachmentCount: number };
  Publications: undefined;
  PublicationDetails: { publicationId: string };
  AdminArea: undefined;
};

export type AdminStackParamList = {
  AdminLogin: undefined;
  AdminHome: undefined;
  AdminCats: undefined;
  AdminCatForm: { catId?: string };
  AdminPreview:
    | { kind: 'cat'; draft: CatDraft }
    | { kind: 'campaign'; draft: Omit<Campaign, 'id'> }
    | { kind: 'article'; draft: Omit<GuideArticle, 'id'>; categoryName: string };
  AdminCatPhotos: { catId: string };
  AdminCatHealth: { catId: string };
  AdminReceipts: { kind: 'adoption' | 'medication'; initialStatus?: ReceiptStatus };
  AdminReceiptDetails: { kind: 'adoption' | 'medication'; protocol: string };
  AdminCampaigns: undefined;
  AdminCampaignForm: { campaignId?: string };
  AdminGuide: undefined;
  AdminArticleForm: { articleId?: string };
  AdminCategoryForm: { categoryId?: string };
  AdminPartners: undefined;
  AdminPartnerForm: { partnerId?: string };
  AdminInfo: undefined;
  AdminInfoForm: { sectionId: string };
  AdminPublications: undefined;
  AdminPublicationForm: { publicationId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Cats: undefined;
  Campaigns: undefined;
  Guide: undefined;
  More: undefined;
};

