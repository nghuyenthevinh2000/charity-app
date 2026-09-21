import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Fund,
  FundId,
  DonationInput,
  MonasteryTransaction,
  PrayerIntention,
  CommunityComment,
  CreateDonationPayload,
  LaunchFundPayload,
  LogExpensePayload,
  TxInput,
} from '../types';
import { initialFunds, initialDonations, initialTransactions } from '../data/seedDataVI';

export const STORAGE_KEY_FUNDS = 'lotus_funds';
export const STORAGE_KEY_DONATIONS = 'lotus_donations';
export const STORAGE_KEY_TRANSACTIONS = 'lotus_transactions';
export const STORAGE_KEY_STEWARD = 'lotus_steward_unlocked';

export const DEFAULT_STEWARD_PIN = '1080';

export interface MonasteryStoreContextType {
  funds: Fund[];
  donations: DonationInput[];
  transactions: MonasteryTransaction[];
  isStewardUnlocked: boolean;

  addDonation: {
    (payload: CreateDonationPayload): DonationInput;
    (
      fundId: FundId,
      amount: number,
      donorName: string,
      isAnonymous: boolean,
      prayerIntention?: {
        category: PrayerIntention['category'];
        dedicationText: string;
        isPublic?: boolean;
      }
    ): DonationInput;
  };

  logExpense: {
    (payload: LogExpensePayload): MonasteryTransaction;
    (
      fundId: FundId,
      amount: number,
      merchant: string,
      items: string[],
      purpose: string,
      receiptImageUrl: string,
      receiptHash?: string,
      verifiedBy?: string
    ): MonasteryTransaction;
  };

  launchNewFund: (fundData: LaunchFundPayload) => Fund;
  blessPrayerIntention: (donationId: string) => boolean;
  addCommentToPrayer: (donationId: string, comment: string | Partial<CommunityComment>) => boolean;
  rejoiceMerit: (donationId: string) => boolean;

  unlockSteward: (pin: string) => boolean;
  lockSteward: () => void;
  resetStore: () => void;

  getFund: (fundId: FundId) => Fund | undefined;
  getDonation: (idOrTxHash: string) => DonationInput | undefined;
}

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or access errors
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

function generateTxHash(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return '0x' + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  }
  return '0x' + Math.random().toString(16).substring(2, 10);
}

function generateReceiptHash(): string {
  const hex =
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 10);
  return 'sha256:' + hex;
}

export const MonasteryStoreContext = createContext<MonasteryStoreContextType | undefined>(undefined);

export interface MonasteryStoreProviderProps {
  children: ReactNode;
  initialFunds?: Fund[];
  initialDonations?: DonationInput[];
  initialTransactions?: MonasteryTransaction[];
  initialStewardUnlocked?: boolean;
}

export function MonasteryStoreProvider({
  children,
  initialFunds: propFunds,
  initialDonations: propDonations,
  initialTransactions: propTransactions,
  initialStewardUnlocked: propSteward,
}: MonasteryStoreProviderProps) {
  const [funds, setFundsState] = useState<Fund[]>(() => {
    if (propFunds) return propFunds;
    return safeGetItem<Fund[]>(STORAGE_KEY_FUNDS, initialFunds);
  });

  const [donations, setDonationsState] = useState<DonationInput[]>(() => {
    if (propDonations) return propDonations;
    return safeGetItem<DonationInput[]>(STORAGE_KEY_DONATIONS, initialDonations);
  });

  const [transactions, setTransactionsState] = useState<MonasteryTransaction[]>(() => {
    if (propTransactions) return propTransactions;
    const stored = safeGetItem<MonasteryTransaction[]>(STORAGE_KEY_TRANSACTIONS, initialTransactions);
    if (Array.isArray(stored)) {
      let changed = false;
      const updated = stored.map((tx) => {
        const seedMatch = initialTransactions.find(
          (itx) => itx.id === tx.id || itx.spentOutput?.id === tx.spentOutput?.id
        );
        if (seedMatch) {
          const currentUrl = tx.spentOutput?.receiptImageUrl;
          const seedUrl = seedMatch.spentOutput?.receiptImageUrl;
          if (
            !currentUrl ||
            currentUrl.startsWith('/docs/mockups/') ||
            currentUrl.startsWith('/images/') ||
            currentUrl !== seedUrl
          ) {
            changed = true;
            return {
              ...tx,
              spentOutput: {
                ...tx.spentOutput,
                receiptImageUrl: seedUrl,
              },
            };
          }
        }
        return tx;
      });
      if (changed) {
        safeSetItem(STORAGE_KEY_TRANSACTIONS, updated);
      }
      return updated;
    }
    return stored;
  });

  const [isStewardUnlocked, setIsStewardUnlockedState] = useState<boolean>(() => {
    if (typeof propSteward === 'boolean') return propSteward;
    return safeGetItem<boolean>(STORAGE_KEY_STEWARD, false);
  });

  const setFunds = useCallback((newFunds: Fund[] | ((prev: Fund[]) => Fund[])) => {
    setFundsState((prev) => {
      const next = typeof newFunds === 'function' ? newFunds(prev) : newFunds;
      safeSetItem(STORAGE_KEY_FUNDS, next);
      return next;
    });
  }, []);

  const setDonations = useCallback((newDonations: DonationInput[] | ((prev: DonationInput[]) => DonationInput[])) => {
    setDonationsState((prev) => {
      const next = typeof newDonations === 'function' ? newDonations(prev) : newDonations;
      safeSetItem(STORAGE_KEY_DONATIONS, next);
      return next;
    });
  }, []);

  const setTransactions = useCallback(
    (newTransactions: MonasteryTransaction[] | ((prev: MonasteryTransaction[]) => MonasteryTransaction[])) => {
      setTransactionsState((prev) => {
        const next = typeof newTransactions === 'function' ? newTransactions(prev) : newTransactions;
        safeSetItem(STORAGE_KEY_TRANSACTIONS, next);
        return next;
      });
    },
    []
  );

  const setIsStewardUnlocked = useCallback((unlocked: boolean) => {
    setIsStewardUnlockedState(unlocked);
    safeSetItem(STORAGE_KEY_STEWARD, unlocked);
  }, []);

  // Add donation
  const addDonation = useCallback<MonasteryStoreContextType['addDonation']>(
    (
      payloadOrFundId: CreateDonationPayload | FundId,
      amountArg?: number,
      donorNameArg?: string,
      isAnonymousArg?: boolean,
      prayerIntentionArg?: {
        category: PrayerIntention['category'];
        dedicationText: string;
        isPublic?: boolean;
      }
    ): DonationInput => {
      let payload: CreateDonationPayload;
      if (typeof payloadOrFundId === 'object' && payloadOrFundId !== null) {
        payload = payloadOrFundId;
      } else {
        payload = {
          fundId: payloadOrFundId,
          amount: amountArg ?? 0,
          donorName: donorNameArg ?? '',
          isAnonymous: isAnonymousArg ?? false,
          prayerIntention: prayerIntentionArg,
        };
      }

      const donationId = 'd' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const txHash = generateTxHash();
      const donorDisplayName = payload.isAnonymous ? 'Anonymous Devotee' : (payload.donorName || 'Devotee');

      let prayerIntention: PrayerIntention | undefined;
      if (payload.prayerIntention && payload.prayerIntention.dedicationText) {
        prayerIntention = {
          id: 'p' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          category: payload.prayerIntention.category,
          dedicationText: payload.prayerIntention.dedicationText,
          isPublic: payload.prayerIntention.isPublic ?? true,
          blessingStatus: 'queued',
          rejoiceCount: 0,
          comments: [],
        };
      }

      const newDonation: DonationInput = {
        id: donationId,
        txHash,
        donorName: donorDisplayName,
        isAnonymous: Boolean(payload.isAnonymous),
        amount: Number(payload.amount),
        fundId: payload.fundId,
        date: new Date().toISOString().split('T')[0],
        prayerIntention,
      };

      // Update donations (prepended)
      setDonations((prev) => [newDonation, ...prev]);

      // Update fund balance and supporters count
      setFunds((prev) =>
        prev.map((fund) => {
          if (fund.id === payload.fundId) {
            return {
              ...fund,
              currentBalance: fund.currentBalance + Number(payload.amount),
              supportersCount: fund.supportersCount + 1,
            };
          }
          return fund;
        })
      );

      return newDonation;
    },
    [setDonations, setFunds]
  );

  // Log expense with UTXO invariant
  const logExpense = useCallback<MonasteryStoreContextType['logExpense']>(
    (
      payloadOrFundId: LogExpensePayload | FundId,
      amountArg?: number,
      merchantArg?: string,
      itemsArg?: string[],
      purposeArg?: string,
      receiptImageUrlArg?: string,
      receiptHashArg?: string,
      verifiedByArg?: string
    ): MonasteryTransaction => {
      let payload: LogExpensePayload;
      if (typeof payloadOrFundId === 'object' && payloadOrFundId !== null) {
        payload = payloadOrFundId;
      } else {
        payload = {
          fundId: payloadOrFundId,
          amount: amountArg ?? 0,
          merchant: merchantArg ?? '',
          items: itemsArg ?? [],
          purpose: purposeArg ?? '',
          receiptImageUrl: receiptImageUrlArg ?? '',
          receiptHash: receiptHashArg,
          verifiedBy: verifiedByArg,
        };
      }

      const expenseAmount = Number(payload.amount);
      const targetFundId = payload.fundId;

      // Select inputs from donations belonging to this fund
      const fundDonations = donations.filter((d) => d.fundId === targetFundId);

      const inputs: TxInput[] = [];
      let inputTotal = 0;

      for (const donation of fundDonations) {
        if (inputTotal >= expenseAmount) break;
        const available = donation.amount;
        const needed = expenseAmount - inputTotal;
        const contribution = Math.min(available, needed);

        inputs.push({
          donationId: donation.id,
          txHash: donation.txHash,
          donorName: donation.donorName,
          amountContributed: Number(contribution.toFixed(2)),
        });
        inputTotal += contribution;
      }

      // If fund donations are insufficient, supplement from general treasury reserve pool
      if (inputTotal < expenseAmount) {
        const remainingNeeded = Number((expenseAmount - inputTotal).toFixed(2));
        inputs.push({
          donationId: `treasury-${targetFundId}`,
          txHash: generateTxHash(),
          donorName: 'Monastery General Treasury Reserve',
          amountContributed: remainingNeeded,
        });
        inputTotal += remainingNeeded;
      }

      // Round to avoid IEEE 754 precision drift
      const roundedInputTotal = Number(inputs.reduce((sum, inp) => sum + inp.amountContributed, 0).toFixed(2));
      const changeAmount = Number(Math.max(0, roundedInputTotal - expenseAmount).toFixed(2));

      const newTx: MonasteryTransaction = {
        id: 'tx-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        txHash: generateTxHash(),
        date: new Date().toISOString().split('T')[0],
        fundId: targetFundId,
        inputs,
        spentOutput: {
          id: 's-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          merchant: payload.merchant,
          amount: expenseAmount,
          items: payload.items || [],
          purpose: payload.purpose,
          receiptImageUrl: payload.receiptImageUrl || '',
          receiptHash: payload.receiptHash || generateReceiptHash(),
          verifiedBy: payload.verifiedBy || 'Monastery Kitchen Steward Thich Minh Thong',
          verifiedAt: new Date().toISOString().split('T')[0],
        },
        changeOutput: {
          amount: changeAmount,
          destinationFundId: targetFundId,
        },
      };

      // Add to transactions (prepended)
      setTransactions((prev) => [newTx, ...prev]);

      // Deduct from fund balance
      setFunds((prev) =>
        prev.map((fund) => {
          if (fund.id === targetFundId) {
            return {
              ...fund,
              currentBalance: Math.max(0, fund.currentBalance - expenseAmount),
            };
          }
          return fund;
        })
      );

      return newTx;
    },
    [donations, setTransactions, setFunds]
  );

  // Launch new cause fund
  const launchNewFund = useCallback(
    (fundData: LaunchFundPayload): Fund => {
      const slug =
        fundData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || ('fund-' + Date.now().toString(36));

      // Check if slug already exists
      const existing = funds.find((f) => f.id === slug);
      const fundId = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

      let daysRemaining = 30;
      if (fundData.deadline) {
        const targetMs = new Date(fundData.deadline).getTime();
        const nowMs = Date.now();
        if (!isNaN(targetMs)) {
          daysRemaining = Math.max(0, Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24)));
        }
      }

      const newFund: Fund = {
        id: fundId,
        name: fundData.name,
        description: fundData.description,
        category: fundData.category,
        targetAmount: Number(fundData.targetAmount),
        currentBalance: 0,
        deadline: fundData.deadline,
        daysRemaining,
        verifiedStatus: {
          isVerified: true,
          attestedBy: 'Abbot Thich Tam Duc',
          badgeLabel: 'Verified by Abbot ✓',
        },
        supportersCount: 0,
        icon: fundData.icon || 'HeartPulse',
        color: fundData.color || '#D97706',
      };

      setFunds((prev) => [...prev, newFund]);
      return newFund;
    },
    [funds, setFunds]
  );

  // Bless prayer intention
  const blessPrayerIntention = useCallback(
    (donationId: string): boolean => {
      let found = false;
      setDonations((prev) =>
        prev.map((d) => {
          if ((d.id === donationId || d.prayerIntention?.id === donationId) && d.prayerIntention) {
            found = true;
            return {
              ...d,
              prayerIntention: {
                ...d.prayerIntention,
                blessingStatus: 'blessed' as const,
                blessedAt: new Date().toISOString(),
              },
            };
          }
          return d;
        })
      );
      return found;
    },
    [setDonations]
  );

  // Add comment to prayer
  const addCommentToPrayer = useCallback(
    (donationId: string, comment: string | Partial<CommunityComment>): boolean => {
      let found = false;
      const commentObj: CommunityComment =
        typeof comment === 'string'
          ? {
              id: 'c-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
              authorName: 'Devotee',
              authorRole: 'devotee',
              commentText: comment,
              createdAt: new Date().toISOString(),
            }
          : {
              id: comment.id || 'c-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
              authorName: comment.authorName || 'Devotee',
              authorRole: comment.authorRole || 'devotee',
              monkTitle: comment.monkTitle,
              commentText: comment.commentText || '',
              createdAt: comment.createdAt || new Date().toISOString(),
            };

      setDonations((prev) =>
        prev.map((d) => {
          if ((d.id === donationId || d.prayerIntention?.id === donationId) && d.prayerIntention) {
            found = true;
            return {
              ...d,
              prayerIntention: {
                ...d.prayerIntention,
                comments: [...(d.prayerIntention.comments || []), commentObj],
              },
            };
          }
          return d;
        })
      );
      return found;
    },
    [setDonations]
  );

  // Rejoice in merit
  const rejoiceMerit = useCallback(
    (donationId: string): boolean => {
      let found = false;
      setDonations((prev) =>
        prev.map((d) => {
          if ((d.id === donationId || d.prayerIntention?.id === donationId) && d.prayerIntention) {
            found = true;
            return {
              ...d,
              prayerIntention: {
                ...d.prayerIntention,
                rejoiceCount: (d.prayerIntention.rejoiceCount || 0) + 1,
              },
            };
          }
          return d;
        })
      );
      return found;
    },
    [setDonations]
  );

  // Steward authentication
  const unlockSteward = useCallback(
    (pin: string): boolean => {
      if (pin === DEFAULT_STEWARD_PIN) {
        setIsStewardUnlocked(true);
        return true;
      }
      return false;
    },
    [setIsStewardUnlocked]
  );

  const lockSteward = useCallback(() => {
    setIsStewardUnlocked(false);
  }, [setIsStewardUnlocked]);

  // Reset store
  const resetStore = useCallback(() => {
    setFundsState(initialFunds);
    setDonationsState(initialDonations);
    setTransactionsState(initialTransactions);
    setIsStewardUnlockedState(false);

    safeRemoveItem(STORAGE_KEY_FUNDS);
    safeRemoveItem(STORAGE_KEY_DONATIONS);
    safeRemoveItem(STORAGE_KEY_TRANSACTIONS);
    safeRemoveItem(STORAGE_KEY_STEWARD);
  }, []);

  // Helpers
  const getFund = useCallback(
    (fundId: FundId) => {
      return funds.find((f) => f.id === fundId);
    },
    [funds]
  );

  const getDonation = useCallback(
    (idOrTxHash: string) => {
      const q = idOrTxHash.toLowerCase();
      return donations.find((d) => d.id.toLowerCase() === q || d.txHash.toLowerCase() === q);
    },
    [donations]
  );

  const value: MonasteryStoreContextType = {
    funds,
    donations,
    transactions,
    isStewardUnlocked,
    addDonation,
    logExpense,
    launchNewFund,
    blessPrayerIntention,
    addCommentToPrayer,
    rejoiceMerit,
    unlockSteward,
    lockSteward,
    resetStore,
    getFund,
    getDonation,
  };

  return <MonasteryStoreContext.Provider value={value}>{children}</MonasteryStoreContext.Provider>;
}

export function useMonasteryStore(): MonasteryStoreContextType {
  const context = useContext(MonasteryStoreContext);
  if (!context) {
    throw new Error('useMonasteryStore must be used within a MonasteryStoreProvider');
  }
  return context;
}
