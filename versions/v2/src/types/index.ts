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
