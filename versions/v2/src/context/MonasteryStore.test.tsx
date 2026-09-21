import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MonasteryStoreProvider, useMonasteryStore } from './MonasteryStore';
import { useMonasteryStore as useMonasteryStoreFromHook } from '../hooks/useMonasteryStore';
import { verifyUtxoInvariant } from '../utils/utxo';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MonasteryStoreProvider>{children}</MonasteryStoreProvider>
);

const useMonasteryStoreHook = () =>
  renderHook(() => useMonasteryStore(), {
    wrapper,
  });

describe('MonasteryStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows making a donation and updates fund balance', () => {
    const { result } = useMonasteryStoreHook();
    const initialBalance = result.current.funds.find((f) => f.id === 'alms')?.currentBalance || 0;
    const initialSupporters = result.current.funds.find((f) => f.id === 'alms')?.supportersCount || 0;

    let donationResult: any;
    act(() => {
      donationResult = result.current.addDonation({
        fundId: 'alms',
        amount: 50,
        donorName: 'Test Donor',
        isAnonymous: false,
        prayerIntention: {
          category: 'healing',
          dedicationText: 'May all be healthy',
          isPublic: true,
        },
      });
    });

    const updated = result.current.funds.find((f) => f.id === 'alms')?.currentBalance;
    const updatedSupporters = result.current.funds.find((f) => f.id === 'alms')?.supportersCount;

    expect(updated).toBe(initialBalance + 50);
    expect(updatedSupporters).toBe(initialSupporters + 1);
    expect(donationResult).toBeDefined();
    expect(donationResult.txHash).toMatch(/^0x/);
    expect(donationResult.amount).toBe(50);
    expect(donationResult.prayerIntention?.dedicationText).toBe('May all be healthy');
    expect(donationResult.prayerIntention?.blessingStatus).toBe('queued');

    // Also check that it's in donations list
    expect(result.current.donations.some((d) => d.id === donationResult.id)).toBe(true);
  });

  it('allows monks to launch a new cause fund', () => {
    const { result } = useMonasteryStoreHook();
    act(() => {
      result.current.launchNewFund({
        name: 'Winter Robes Drive',
        description: 'Warm robes for winter retreat',
        category: 'special-drive',
        targetAmount: 2000,
        deadline: '2026-11-15',
      });
    });

    const createdFund = result.current.funds.find((f) => f.name === 'Winter Robes Drive');
    expect(createdFund).toBeDefined();
    expect(createdFund?.targetAmount).toBe(2000);
    expect(createdFund?.currentBalance).toBe(0);
    expect(createdFund?.verifiedStatus.isVerified).toBe(true);
    expect(createdFund?.supportersCount).toBe(0);
  });

  it('persists changes to localStorage and reloads them on fresh mount', () => {
    const { result: firstRender } = useMonasteryStoreHook();

    act(() => {
      firstRender.current.addDonation({
        fundId: 'healthcare',
        amount: 120,
        donorName: 'Generous Devotee',
        isAnonymous: false,
      });
    });

    // Check localStorage has the serialized data
    const storedDonations = JSON.parse(localStorage.getItem('lotus_donations') || '[]');
    expect(storedDonations.some((d: any) => d.donorName === 'Generous Devotee' && d.amount === 120)).toBe(true);

    // Fresh mount should read from localStorage
    const { result: secondRender } = useMonasteryStoreHook();
    const hcFund = secondRender.current.funds.find((f) => f.id === 'healthcare');
    expect(hcFund?.currentBalance).toBe(980 + 120); // 980 initial + 120
    expect(secondRender.current.donations.some((d) => d.donorName === 'Generous Devotee')).toBe(true);
  });

  it('logs an expense, deducts fund balance, and creates a valid UTXO transaction', () => {
    const { result } = useMonasteryStoreHook();
    const initialBalance = result.current.funds.find((f) => f.id === 'alms')?.currentBalance || 0;

    let txResult: any;
    act(() => {
      txResult = result.current.logExpense({
        fundId: 'alms',
        amount: 30,
        merchant: 'Mountain Produce Market',
        items: ['Organic Tofu', 'Brown Rice'],
        purpose: 'Monastery midday meal offerings',
        receiptImageUrl: '/receipts/meal-01.jpg',
      });
    });

    expect(txResult).toBeDefined();
    expect(txResult.fundId).toBe('alms');
    expect(txResult.spentOutput.amount).toBe(30);
    expect(txResult.spentOutput.merchant).toBe('Mountain Produce Market');

    // Fundamental UTXO invariant verification
    expect(verifyUtxoInvariant(txResult)).toBe(true);

    // Fund balance updated
    const updatedBalance = result.current.funds.find((f) => f.id === 'alms')?.currentBalance;
    expect(updatedBalance).toBe(initialBalance - 30);

    // Added to transactions list
    expect(result.current.transactions.some((tx) => tx.id === txResult.id)).toBe(true);
  });

  it('allows blessing a prayer intention and updates blessingStatus', () => {
    const { result } = useMonasteryStoreHook();

    // d5 is queued in initialDonations
    const targetDonation = result.current.donations.find((d) => d.id === 'd5');
    expect(targetDonation?.prayerIntention?.blessingStatus).toBe('queued');

    act(() => {
      result.current.blessPrayerIntention('d5');
    });

    const updatedDonation = result.current.donations.find((d) => d.id === 'd5');
    expect(updatedDonation?.prayerIntention?.blessingStatus).toBe('blessed');
    expect(updatedDonation?.prayerIntention?.blessedAt).toBeDefined();
  });

  it('allows adding a community comment to a prayer intention', () => {
    const { result } = useMonasteryStoreHook();

    act(() => {
      result.current.addCommentToPrayer('d5', {
        authorName: 'Brother Minh Hanh',
        authorRole: 'monk',
        monkTitle: 'Venerable Elder',
        commentText: 'May peaceful winds bless your family always.',
      });
    });

    const updated = result.current.donations.find((d) => d.id === 'd5');
    const comment = updated?.prayerIntention?.comments.find(
      (c) => c.commentText === 'May peaceful winds bless your family always.'
    );
    expect(comment).toBeDefined();
    expect(comment?.authorRole).toBe('monk');
  });

  it('allows adding a string comment to a prayer intention', () => {
    const { result } = useMonasteryStoreHook();

    act(() => {
      result.current.addCommentToPrayer('d1', 'Deep gratitude and prayers 🙏');
    });

    const updated = result.current.donations.find((d) => d.id === 'd1');
    const comment = updated?.prayerIntention?.comments.find(
      (c) => c.commentText === 'Deep gratitude and prayers 🙏'
    );
    expect(comment).toBeDefined();
    expect(comment?.authorRole).toBe('devotee');
  });

  it('allows rejoicing in merit and increments rejoiceCount', () => {
    const { result } = useMonasteryStoreHook();

    const initialCount = result.current.donations.find((d) => d.id === 'd1')?.prayerIntention?.rejoiceCount || 0;

    act(() => {
      result.current.rejoiceMerit('d1');
    });

    const updated = result.current.donations.find((d) => d.id === 'd1');
    expect(updated?.prayerIntention?.rejoiceCount).toBe(initialCount + 1);
  });

  it('handles steward PIN authorization correctly (PIN: 1080)', () => {
    const { result } = useMonasteryStoreHook();

    expect(result.current.isStewardUnlocked).toBe(false);

    let unlockSuccess: boolean | undefined;
    act(() => {
      unlockSuccess = result.current.unlockSteward('wrong-pin');
    });
    expect(unlockSuccess).toBe(false);
    expect(result.current.isStewardUnlocked).toBe(false);

    act(() => {
      unlockSuccess = result.current.unlockSteward('1080');
    });
    expect(unlockSuccess).toBe(true);
    expect(result.current.isStewardUnlocked).toBe(true);

    act(() => {
      result.current.lockSteward();
    });
    expect(result.current.isStewardUnlocked).toBe(false);
  });

  it('handles anonymous donations with anonymous donor label', () => {
    const { result } = useMonasteryStoreHook();

    let donation: any;
    act(() => {
      donation = result.current.addDonation({
        fundId: 'operations',
        amount: 25,
        donorName: 'Private Giver',
        isAnonymous: true,
      });
    });

    expect(donation.isAnonymous).toBe(true);
    expect(donation.donorName).toBe('Anonymous Devotee');
  });

  it('supports positional argument invocation of addDonation and logExpense', () => {
    const { result } = useMonasteryStoreHook();

    let donation: any;
    act(() => {
      donation = result.current.addDonation(
        'utilities',
        75,
        'Lotus Friend',
        false,
        {
          category: 'peace',
          dedicationText: 'May all beings be in light',
          isPublic: true,
        }
      );
    });
    expect(donation.amount).toBe(75);
    expect(donation.fundId).toBe('utilities');

    let expense: any;
    act(() => {
      expense = result.current.logExpense(
        'utilities',
        40,
        'Electric Co',
        ['Grid maintenance'],
        'Solar battery service',
        '/solar.png'
      );
    });
    expect(expense.spentOutput.amount).toBe(40);
    expect(verifyUtxoInvariant(expense)).toBe(true);
  });

  it('works when imported through useMonasteryStore from hooks', () => {
    const { result } = renderHook(() => useMonasteryStoreFromHook(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MonasteryStoreProvider>{children}</MonasteryStoreProvider>
      ),
    });

    expect(result.current.funds.length).toBeGreaterThan(0);
    expect(result.current.donations.length).toBeGreaterThan(0);
    expect(result.current.transactions.length).toBeGreaterThan(0);
  });

  it('throws an error when useMonasteryStore is used outside MonasteryStoreProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useMonasteryStore());
    }).toThrow('useMonasteryStore must be used within a MonasteryStoreProvider');
    consoleSpy.mockRestore();
  });

  it('resets store back to initial seed data when resetStore is called', () => {
    const { result } = useMonasteryStoreHook();

    act(() => {
      result.current.launchNewFund({
        name: 'Temporary Drive',
        description: 'To be wiped',
        category: 'operations',
        targetAmount: 500,
        deadline: '2026-12-01',
      });
    });

    expect(result.current.funds.some((f) => f.name === 'Temporary Drive')).toBe(true);

    act(() => {
      result.current.resetStore();
    });

    expect(result.current.funds.some((f) => f.name === 'Temporary Drive')).toBe(false);
    expect(result.current.funds.length).toBe(4);
  });
});

describe('MonasteryStore V2 Package & Proof Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows creating a new charity package by monk steward', () => {
    const { result } = renderHook(() => useMonasteryStore(), { wrapper });

    act(() => {
      result.current.unlockSteward('1080');
    });

    let newPkg: any;
    act(() => {
      newPkg = result.current.createPackage({
        title: 'Monastery Medical Camp',
        description: 'Free eye exams and medication',
        category: 'medical',
        unitPrice: 15,
        targetUnits: 50,
        itemsIncluded: ['Eye Drops', 'Prescription Glasses Voucher'],
      });
    });

    expect(newPkg).toBeDefined();
    expect(newPkg.title).toBe('Monastery Medical Camp');
    expect(result.current.packages.some((p) => p.id === newPkg.id)).toBe(true);
  });

  it('allows a devotee to purchase a package and records user impact', () => {
    const { result } = renderHook(() => useMonasteryStore(), { wrapper });
    const targetPkg = result.current.packages[0];
    const initialFunded = targetPkg.fundedUnits;

    let purchase: any;
    act(() => {
      purchase = result.current.purchasePackage({
        packageId: targetPkg.id,
        unitsBought: 2,
        donorName: 'Bodhi Heart',
        isAnonymous: false,
        dedicationNote: 'For all sentient beings',
      });
    });

    expect(purchase).toBeDefined();
    expect(purchase.unitsBought).toBe(2);
    expect(purchase.txHash).toMatch(/^0x[a-f0-9]{64}$/);

    // Check updated package fundedUnits
    const updatedPkg = result.current.packages.find((p) => p.id === targetPkg.id);
    expect(updatedPkg?.fundedUnits).toBe(initialFunded + 2);

    // Check userPurchases includes this purchase
    expect(result.current.userPurchases.some((p) => p.id === purchase.id)).toBe(true);
  });

  it('allows uploading a proof of giving and updates linked package & purchases', () => {
    const { result } = renderHook(() => useMonasteryStore(), { wrapper });
    const targetPkg = result.current.packages[0];

    // Purchase first so we have a queued purchase
    act(() => {
      result.current.purchasePackage({
        packageId: targetPkg.id,
        unitsBought: 1,
        donorName: 'Test Devotee',
        isAnonymous: false,
      });
    });

    let proofBatch: any;
    act(() => {
      proofBatch = result.current.uploadGivingProof({
        packageId: targetPkg.id,
        unitsDistributed: 10,
        location: 'Highland Hamlet 3',
        missionReport: 'Delivered successfully in rainy conditions.',
        heartfeltPhotos: [
          {
            url: 'https://example.com/photo1.jpg',
            caption: 'Monk handing kit',
            beneficiaryNote: 'Recipient was smiling',
          },
        ],
      });
    });

    expect(proofBatch).toBeDefined();
    expect(proofBatch.distributionTxHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(proofBatch.merkleRootHash).toMatch(/^sha256:[a-f0-9]{64}$/);

    // Package distributed count increased
    const updatedPkg = result.current.packages.find((p) => p.id === targetPkg.id);
    expect(updatedPkg?.distributedUnits).toBeGreaterThanOrEqual(10);
  });

  it('allows adding community comments to a proof batch', () => {
    const { result } = renderHook(() => useMonasteryStore(), { wrapper });
    const proofId = result.current.proofBatches[0].id;

    act(() => {
      result.current.addCommentToProof(proofId, {
        authorName: 'Lotus Disciple',
        authorRole: 'devotee',
        commentText: 'Sadhu Sadhu Sadhu! Touching proof.',
      });
    });

    const updatedProof = result.current.proofBatches.find((b) => b.id === proofId);
    expect(updatedProof?.comments.some((c) => c.commentText.includes('Sadhu'))).toBe(true);
  });

  it('resets V2 package, proof, and purchase data when resetStore is called', () => {
    const { result } = renderHook(() => useMonasteryStore(), { wrapper });

    act(() => {
      result.current.createPackage({
        title: 'Temporary Test Package',
        description: 'To be wiped',
        category: 'food',
        unitPrice: 10,
        targetUnits: 10,
        itemsIncluded: ['Item 1'],
      });
    });

    expect(result.current.packages.some((p) => p.title === 'Temporary Test Package')).toBe(true);

    act(() => {
      result.current.resetStore();
    });

    expect(result.current.packages.some((p) => p.title === 'Temporary Test Package')).toBe(false);
    expect(result.current.packages.length).toBe(4);
    expect(result.current.userPurchases.length).toBe(0);
  });
});

