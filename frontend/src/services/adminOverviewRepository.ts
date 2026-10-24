import { AdminOverview } from '../types/admin';
import { AdminReceiptItem, ReceiptStatusCounts } from '../types/adminReceipt';
import { campaignRepository } from './campaignRepository';
import { catRepository } from './catRepository';
import { guideRepository } from './guideRepository';
import { receiptRepository } from './adminReceiptRepository';

function countStatuses(items: AdminReceiptItem[]): ReceiptStatusCounts {
  const counts: ReceiptStatusCounts = { pending: 0, in_review: 0, approved: 0, rejected: 0 };
  items.forEach((item) => { if (item.source !== 'example') counts[item.status] += 1; });
  return counts;
}

export const adminOverviewRepository = {
  async get(): Promise<AdminOverview> {
    const [cats, campaigns, articles, adoptionReceipts, medicationReceipts] = await Promise.all([
      catRepository.list(),
      campaignRepository.list(),
      guideRepository.listArticles(),
      receiptRepository.list('adoption'),
      receiptRepository.list('medication'),
    ]);
    const adoptionByStatus = countStatuses(adoptionReceipts);
    const medicationByStatus = countStatuses(medicationReceipts);
    return {
      cats: cats.length,
      availableCats: cats.filter((cat) => cat.adoptionStatus === 'available').length,
      campaigns: campaigns.length,
      articles: articles.length,
      adoptionReceipts: adoptionReceipts.filter((item) => item.source !== 'example').length,
      medicationReceipts: medicationReceipts.filter((item) => item.source !== 'example').length,
      adoptionByStatus,
      medicationByStatus,
    };
  },
};
