import { describe, it, expect } from 'vitest';
import { generateTxHash, generateMerkleRoot, calculateProgress } from './crypto';

describe('Crypto Proof Utilities', () => {
  it('generates deterministic transaction hashes prefixed with 0x and length 66', () => {
    const hash1 = generateTxHash('donation-1-seed');
    const hash2 = generateTxHash('donation-1-seed');
    const hash3 = generateTxHash('donation-2-seed');

    expect(hash1).toMatch(/^0x[a-f0-9]{64}$/);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('generates consistent Merkle roots from an array of hashes', () => {
    const leaves = [
      '0x1111111111111111111111111111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333333333333333333333333333',
    ];
    const root1 = generateMerkleRoot(leaves);
    const root2 = generateMerkleRoot(leaves);

    expect(root1).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(root1).toBe(root2);
  });

  it('handles empty leaves safely in Merkle root calculation', () => {
    const root = generateMerkleRoot([]);
    expect(root).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('calculates progress percentage correctly with rounding and completion flag', () => {
    expect(calculateProgress(50, 100)).toEqual({ percent: 50, isComplete: false });
    expect(calculateProgress(100, 100)).toEqual({ percent: 100, isComplete: true });
    expect(calculateProgress(120, 100)).toEqual({ percent: 100, isComplete: true });
    expect(calculateProgress(0, 50)).toEqual({ percent: 0, isComplete: false });
    expect(calculateProgress(1, 3)).toEqual({ percent: 33, isComplete: false });
  });
});
