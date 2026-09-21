export type FundCategory = 'necessities' | 'healthcare' | 'operations' | 'infrastructure' | 'special-drive';

export type FundId = string;

export interface VerifiedStatus {
  isVerified: boolean;
  attestedBy: string;
  badgeLabel: string;
}

export interface Fund {
  id: FundId;
  name: string;
  description: string;
  category: FundCategory;
  targetAmount: number;
  currentBalance: number;
  deadline: string; // ISO date string or cycle description
  daysRemaining?: number;
  verifiedStatus: VerifiedStatus;
  supportersCount: number;
  icon: string;
  color: string;
}

export type IntentionCategory = 'healing' | 'memorial' | 'peace' | 'gratitude';

export interface CommunityComment {
  id: string;
  authorName: string;
  authorRole: 'monk' | 'devotee';
  monkTitle?: string;
  commentText: string;
  createdAt: string;
}

export interface PrayerIntention {
  id: string;
  category: IntentionCategory;
  dedicationText: string;
  isPublic: boolean;
  blessingStatus: 'queued' | 'blessed';
  blessedAt?: string;
  rejoiceCount: number;
  comments: CommunityComment[];
}

export interface DonationInput {
  id: string;
  txHash: string;
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  fundId: FundId;
  date: string;
  prayerIntention?: PrayerIntention;
}

export interface TxInput {
  donationId: string;
  txHash: string;
  donorName: string;
  amountContributed: number;
}

export interface SpentOutput {
  id: string;
  merchant: string;
  amount: number;
  items: string[];
  purpose: string;
  receiptImageUrl: string;
  receiptHash: string;
  verifiedBy: string;
  verifiedAt: string;
}

export interface ChangeOutput {
  amount: number;
  destinationFundId: FundId;
}

export interface MonasteryTransaction {
  id: string;
  txHash: string;
  date: string;
  fundId: FundId;
  inputs: TxInput[];
  spentOutput: SpentOutput;
  changeOutput: ChangeOutput;
}

export interface ProvenanceBreakdown {
  merchant: string;
  purpose: string;
  amount: number;
  percentage: number;
  date: string;
  receiptImageUrl?: string;
  receiptHash?: string;
}

export interface ProvenanceResult {
  found: boolean;
  donation?: DonationInput;
  totalAmount: number;
  spentAmount: number;
  unspentAmount: number;
  spentPercentage: number;
  unspentPercentage: number;
  breakdowns: ProvenanceBreakdown[];
}

export interface CreateDonationPayload {
  fundId: FundId;
  amount: number;
  donorName: string;
  isAnonymous: boolean;
  prayerIntention?: {
    category: IntentionCategory;
    dedicationText: string;
    isPublic?: boolean;
  };
}

export interface LaunchFundPayload {
  name: string;
  description: string;
  category: FundCategory;
  targetAmount: number;
  deadline: string;
  icon?: string;
  color?: string;
}

export interface LogExpensePayload {
  fundId: FundId;
  amount: number;
  merchant: string;
  items: string[];
  purpose: string;
  receiptImageUrl: string;
  receiptHash?: string;
  verifiedBy?: string;
}

// --- V2 Tangible Charity Package & Cryptographic Proof Types ---

export type PackageCategory = 'food' | 'education' | 'medical' | 'winter' | 'emergency';

export interface CharityPackage {
  id: string;
  title: string;
  description: string;
  category: PackageCategory;
  unitPrice: number;
  targetUnits: number;
  fundedUnits: number;
  distributedUnits: number;
  itemsIncluded: string[];
  coverImageUrl: string;
  bannerGradient: string;
  createdByMonk: string;
  status: 'active' | 'fully_funded' | 'completed';
  createdAt: string;
}

export interface PackagePurchase {
  id: string;
  packageId: string;
  packageTitle: string;
  unitsBought: number;
  unitPrice: number;
  totalAmount: number;
  donorName: string;
  isAnonymous: boolean;
  dedicationNote?: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  fulfillmentStatus: 'queued_distribution' | 'fulfilled_with_proof';
  linkedProofBatchId?: string;
}

export interface GivingProofBatch {
  id: string;
  packageId: string;
  packageTitle: string;
  unitsDistributed: number;
  location: string;
  missionReport: string;
  heartfeltPhotos: Array<{
    id: string;
    url: string;
    caption: string;
    beneficiaryNote: string;
  }>;
  distributionDate: string;
  attestingMonk: string;
  distributionTxHash: string;
  merkleRootHash: string;
  blockNumber: number;
  comments: CampaignComment[];
}

export interface CampaignComment {
  id: string;
  campaignId: string;
  authorName: string;
  authorRole: 'monk' | 'devotee';
  monkBadge?: string;
  commentText: string;
  createdAt: string;
}

export interface CreatePackagePayload {
  title: string;
  description: string;
  category: PackageCategory;
  unitPrice: number;
  targetUnits: number;
  itemsIncluded: string[];
  coverImageUrl?: string;
  bannerGradient?: string;
  createdByMonk?: string;
}

export interface PurchasePackagePayload {
  packageId: string;
  unitsBought: number;
  donorName?: string;
  isAnonymous: boolean;
  dedicationNote?: string;
}

export interface UploadProofPayload {
  packageId: string;
  unitsDistributed: number;
  location: string;
  missionReport: string;
  heartfeltPhotos: Array<{
    url: string;
    caption: string;
    beneficiaryNote: string;
  }>;
  attestingMonk?: string;
}

