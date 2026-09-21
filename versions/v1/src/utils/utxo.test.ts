import { describe, it, expect } from 'vitest';
import { verifyUtxoInvariant, calculateProvenance } from './utxo';
import { MonasteryTransaction, DonationInput } from '../types';
import { initialFunds, initialDonations, initialTransactions } from '../data/seedData';

describe('UTXO Engine', () => {
  it('verifies that Sum(Inputs) equals SpentOutput + ChangeOutput', () => {
    const tx: MonasteryTransaction = {
      id: 'tx-1',
      txHash: '0xa49f',
      date: '2026-09-16',
      fundId: 'alms',
      inputs: [
        { donationId: 'd1', txHash: '0x8e2', donorName: 'Devotee Ananda', amountContributed: 50 },
        { donationId: 'd2', txHash: '0x3c1', donorName: 'Devotee Linh', amountContributed: 40 }
      ],
      spentOutput: {
        id: 's1',
        merchant: 'Green Valley Farmers Market',
        amount: 72.50,
        items: ['Organic Tofu', 'Rice', 'Greens'],
        purpose: 'Fresh lunch for monks',
        receiptImageUrl: '/docs/mockups/screen2-transparency-ledger.jpg',
        receiptHash: 'sha256:e3b0...',
        verifiedBy: 'Kitchen Steward',
        verifiedAt: '2026-09-16'
      },
      changeOutput: {
        amount: 17.50,
        destinationFundId: 'alms'
      }
    };
    expect(verifyUtxoInvariant(tx)).toBe(true);
  });

  it('rejects transaction when Sum(Inputs) does not equal SpentOutput + ChangeOutput', () => {
    const invalidTx: MonasteryTransaction = {
      id: 'tx-invalid',
      txHash: '0xbad1',
      date: '2026-09-16',
      fundId: 'alms',
      inputs: [
        { donationId: 'd1', txHash: '0x8e2', donorName: 'Devotee Ananda', amountContributed: 50 }
      ],
      spentOutput: {
        id: 's1',
        merchant: 'Green Valley Farmers Market',
        amount: 30.00,
        items: ['Rice'],
        purpose: 'Lunch',
        receiptImageUrl: '',
        receiptHash: '',
        verifiedBy: 'Steward',
        verifiedAt: '2026-09-16'
      },
      changeOutput: {
        amount: 15.00, // 30 + 15 = 45 != 50
        destinationFundId: 'alms'
      }
    };
    expect(verifyUtxoInvariant(invalidTx)).toBe(false);
  });

  it('calculates correct donation provenance percentages', () => {
    const donation: DonationInput = {
      id: 'd1',
      txHash: '0x8e2',
      donorName: 'Devotee Ananda',
      isAnonymous: false,
      amount: 50,
      fundId: 'alms',
      date: '2026-09-15'
    };

    const mockTx: MonasteryTransaction = {
      id: 'tx-1',
      txHash: '0xa49f',
      date: '2026-09-16',
      fundId: 'alms',
      inputs: [
        { donationId: 'd1', txHash: '0x8e2', donorName: 'Devotee Ananda', amountContributed: 50 },
        { donationId: 'd2', txHash: '0x3c1', donorName: 'Devotee Linh', amountContributed: 40 }
      ],
      spentOutput: {
        id: 's1',
        merchant: 'Green Valley Farmers Market',
        amount: 72.50,
        items: ['Organic Tofu', 'Rice', 'Greens'],
        purpose: 'Fresh lunch for monks',
        receiptImageUrl: '/docs/mockups/screen2-transparency-ledger.jpg',
        receiptHash: 'sha256:e3b0...',
        verifiedBy: 'Kitchen Steward',
        verifiedAt: '2026-09-16'
      },
      changeOutput: {
        amount: 17.50,
        destinationFundId: 'alms'
      }
    };

    // Total inputs = 90. Devotee contributed 50 (55.55% of pool).
    // Proportional spent = 72.50 * (50 / 90) = 40.28
    // Proportional unspent change = 17.50 * (50 / 90) = 9.72
    const result = calculateProvenance('0x8e2', [mockTx], [donation]);
    expect(result.found).toBe(true);
    expect(result.totalAmount).toBe(50);
    expect(result.spentAmount).toBe(40.28);
    expect(result.unspentAmount).toBe(9.72);
    expect(result.spentPercentage).toBe(80.6);
    expect(result.unspentPercentage).toBe(19.4);
    expect(result.breakdowns.length).toBe(1);
    expect(result.breakdowns[0].merchant).toBe('Green Valley Farmers Market');
  });

  it('handles unspent donation with 100% in treasury reserves', () => {
    const unspentDonation: DonationInput = {
      id: 'd-new',
      txHash: '0x999a',
      donorName: 'Devotee Bodhi',
      isAnonymous: false,
      amount: 100,
      fundId: 'healthcare',
      date: '2026-09-17'
    };

    const result = calculateProvenance('0x999a', [], [unspentDonation]);
    expect(result.found).toBe(true);
    expect(result.totalAmount).toBe(100);
    expect(result.spentAmount).toBe(0);
    expect(result.unspentAmount).toBe(100);
    expect(result.spentPercentage).toBe(0);
    expect(result.unspentPercentage).toBe(100);
    expect(result.breakdowns.length).toBe(0);
  });

  it('returns found: false when txHash is not found', () => {
    const result = calculateProvenance('0xnonexistent', [], []);
    expect(result.found).toBe(false);
    expect(result.totalAmount).toBe(0);
    expect(result.spentAmount).toBe(0);
    expect(result.unspentAmount).toBe(0);
  });

  it('verifies all transactions in seedData satisfy the UTXO invariant', () => {
    expect(initialFunds.length).toBeGreaterThan(0);
    expect(initialDonations.length).toBeGreaterThan(0);
    expect(initialTransactions.length).toBeGreaterThan(0);

    for (const tx of initialTransactions) {
      expect(verifyUtxoInvariant(tx)).toBe(true);
    }
  });
});
