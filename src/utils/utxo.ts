import { MonasteryTransaction, DonationInput, ProvenanceResult, ProvenanceBreakdown } from '../types';

/**
 * Verifies the fundamental UTXO invariant for a monastery spending transaction:
 * Sum(Inputs) === SpentOutput + ChangeOutput (within floating point epsilon 0.001)
 */
export function verifyUtxoInvariant(tx: MonasteryTransaction): boolean {
  if (!tx || !Array.isArray(tx.inputs) || tx.inputs.length === 0) {
    return false;
  }
  if (!tx.spentOutput || typeof tx.spentOutput.amount !== 'number') {
    return false;
  }
  if (!tx.changeOutput || typeof tx.changeOutput.amount !== 'number') {
    return false;
  }

  const sumInputs = tx.inputs.reduce((sum, input) => {
    return sum + (typeof input.amountContributed === 'number' ? input.amountContributed : 0);
  }, 0);

  const sumOutputs = tx.spentOutput.amount + tx.changeOutput.amount;

  return Math.abs(sumInputs - sumOutputs) < 0.001;
}

/**
 * Calculates the provenance and allocation trace of a donation offering.
 * Walks through transactions that consumed the donation as an input, computing:
 * - Total amount offered
 * - Proportional spent amount and merchant breakdowns
 * - Unspent amount retained in treasury reserves
 * - Spent and unspent percentage breakdown
 */
export function calculateProvenance(
  queryHashOrId: string,
  transactions: MonasteryTransaction[],
  donations: DonationInput[]
): ProvenanceResult {
  const notFoundResult: ProvenanceResult = {
    found: false,
    totalAmount: 0,
    spentAmount: 0,
    unspentAmount: 0,
    spentPercentage: 0,
    unspentPercentage: 0,
    breakdowns: []
  };

  if (!queryHashOrId || typeof queryHashOrId !== 'string') {
    return notFoundResult;
  }

  const cleanQuery = queryHashOrId.trim().toLowerCase();

  // Find matching donation by txHash or id
  let donation = donations.find(
    (d) => d.txHash.toLowerCase() === cleanQuery || d.id.toLowerCase() === cleanQuery
  );

  // If not found directly, check if the query matches a transaction hash containing an input
  if (!donation) {
    for (const tx of transactions) {
      if (tx.txHash.toLowerCase() === cleanQuery) {
        const firstInput = tx.inputs[0];
        if (firstInput) {
          donation = donations.find(
            (d) => d.id === firstInput.donationId || d.txHash.toLowerCase() === firstInput.txHash.toLowerCase()
          );
          if (donation) break;
        }
      }
    }
  }

  if (!donation) {
    return notFoundResult;
  }

  const totalAmount = donation.amount;
  let totalSpent = 0;
  const breakdowns: ProvenanceBreakdown[] = [];

  for (const tx of transactions) {
    const matchingInputs = tx.inputs.filter(
      (inp) =>
        inp.donationId === donation?.id ||
        (donation?.txHash && inp.txHash.toLowerCase() === donation.txHash.toLowerCase())
    );

    if (matchingInputs.length > 0) {
      const sumTxInputs = tx.inputs.reduce((sum, inp) => sum + inp.amountContributed, 0);
      const contribution = matchingInputs.reduce((sum, inp) => sum + inp.amountContributed, 0);

      if (sumTxInputs > 0) {
        const poolFraction = contribution / sumTxInputs;
        const spentFromContribution = poolFraction * tx.spentOutput.amount;
        totalSpent += spentFromContribution;

        breakdowns.push({
          merchant: tx.spentOutput.merchant,
          purpose: tx.spentOutput.purpose,
          amount: Number(spentFromContribution.toFixed(2)),
          percentage: totalAmount > 0 ? Number(((spentFromContribution / totalAmount) * 100).toFixed(1)) : 0,
          date: tx.date,
          receiptImageUrl: tx.spentOutput.receiptImageUrl,
          receiptHash: tx.spentOutput.receiptHash
        });
      }
    }
  }

  const spentAmount = Number(totalSpent.toFixed(2));
  const unspentAmount = Number(Math.max(0, totalAmount - spentAmount).toFixed(2));
  const spentPercentage = totalAmount > 0 ? Number(((spentAmount / totalAmount) * 100).toFixed(1)) : 0;
  const unspentPercentage = Number((100 - spentPercentage).toFixed(1));

  return {
    found: true,
    donation,
    totalAmount,
    spentAmount,
    unspentAmount,
    spentPercentage,
    unspentPercentage,
    breakdowns
  };
}
