import { Campaign } from '../../types/campaign';

export const formatBrl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function getCampaignProgress(campaign: Campaign): number {
  if (campaign.goalCents <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((campaign.raisedCents / campaign.goalCents) * 100)));
}
