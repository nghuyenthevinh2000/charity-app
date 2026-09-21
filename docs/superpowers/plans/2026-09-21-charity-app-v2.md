# Charity App Version 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Version 2 of the Lotus Grove Sanctuary Charity Web App, introducing tangible itemized charity packages that devotees can sponsor, cryptographic transaction hashes for all purchases, screen-filling heartfelt on-chain photo proof explorer with 50% bottom sheet drawers, private personal purchase tracking, and a monk steward portal to upload packages and field proofs.

**Architecture:** Version 2 lives in `versions/v2/` managed by `scripts/version-manager.js`, keeping `versions/v1/` intact. Tab 1 offers a single-package swipeable carousel with item tags and dual progress bars. Tab 2 offers screen-filling campaign boxes with full-background photo swiping and mutually exclusive 50% bottom sheet drawers for details and comments, alongside a private "My Purchased Packages" view. Tab 3 gives authenticated monks (PIN 1080) tools to create packages and upload distribution proofs with simulated SHA-256 Merkle roots.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React icons, Vitest, React Testing Library, Canvas Confetti.

**Spec:** [`docs/superpowers/specs/2026-09-21-charity-app-v2-design.md`](file:///Users/thevinhnguyen/Documents/computer-science/projects/app-factory/projects/charity-app/docs/superpowers/specs/2026-09-21-charity-app-v2-design.md)

## Global Constraints

- **Multi-Version Workspace:** Version 2 must be created via `node scripts/version-manager.js create v2 --from v1` and switched to active. `versions/v1/` must remain untouched.
- **Strict 3 Tabs:** Tab 1: Charity Packages (`market`), Tab 2: On-Chain Proof Explorer (`proof`), Tab 3: Monk Steward Portal (`steward`). Old "Prayer Wall" tab is completely removed.
- **Single-Package Viewport:** Tab 1 must show exactly 1 package at a time on screen with swipe gestures, dot indicators, and left/right arrows.
- **Screen-Filling Proof Cards:** Tab 2 campaign boxes must fill viewport height (`calc(100vh - 220px)`, min 580px) with photo background and horizontal photo swipe.
- **50% Bottom Sheet Drawers:** Floating action buttons for `ℹ️ Details` and `💬 Comments` expand a drawer covering exactly the bottom 50% of the card, keeping the top 50% photo visible. Mutually exclusive (expanding one collapses the other).
- **Private Personal Tracker:** Devotee purchases are private to their device/session ("My Purchased Packages"), NOT a public ledger of all individuals.
- **Simulated Cryptography:** Deterministic SHA-256 transaction hashes (`0x...`) and Merkle tree roots without requiring external Web3 browser extensions.
- **Monk PIN:** Monk Steward Portal access code is `1080`.

---

### Task 1: Multi-Version Setup & Baseline Scaffolding

**Files:**
- Create: `versions/v2/` (via version manager script)
- Modify: `versions/v2/package.json`
- Test: Baseline test check via `npm test -- --run`

**Interfaces:**
- Consumes: `scripts/version-manager.js`
- Produces: Active `versions/v2` workspace with clean test baseline

- [ ] **Step 1: Create version 2 from version 1 and switch active version**

Run command:
```bash
node scripts/version-manager.js create v2 --from v1
node scripts/version-manager.js switch v2
```

- [ ] **Step 2: Update `versions/v2/package.json` version field to `2.0.0`**

In `versions/v2/package.json`:
```json
{
  "name": "lotus-sanctuary-charity",
  "private": true,
  "version": "2.0.0"
}
```

- [ ] **Step 3: Run existing test baseline to verify clean inheritance**

Run command:
```bash
npm test -- --run
```
Expected: PASS (all inherited tests pass cleanly in `versions/v2`).

- [ ] **Step 4: Commit baseline setup**

```bash
git add versions/v2 .active-version current
git commit -m "chore(v2): scaffold version 2 from v1 and set as active version"
```

---

### Task 2: V2 Domain Types & Cryptographic Proof Utilities

**Files:**
- Modify: `versions/v2/src/types/index.ts`
- Create: `versions/v2/src/utils/crypto.ts`
- Create: `versions/v2/src/utils/crypto.test.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - Types: `PackageCategory`, `CharityPackage`, `PackagePurchase`, `GivingProofBatch`, `CampaignComment`, `CreatePackagePayload`, `PurchasePackagePayload`, `UploadProofPayload`
  - Functions: `generateTxHash(seed: string): string`, `generateMerkleRoot(elements: string[]): string`, `calculateProgress(current: number, target: number): { percent: number; isComplete: boolean }`

- [ ] **Step 1: Write the failing tests for crypto utilities**

Create `versions/v2/src/utils/crypto.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run versions/v2/src/utils/crypto.test.ts`
Expected: FAIL with missing module `crypto`.

- [ ] **Step 3: Define V2 types in `versions/v2/src/types/index.ts`**

Append or update `versions/v2/src/types/index.ts` with V2 types:
```typescript
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
```

- [ ] **Step 4: Implement `versions/v2/src/utils/crypto.ts`**

Create `versions/v2/src/utils/crypto.ts`:
```typescript
function simpleHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part3}${part4}`;
}

export function generateTxHash(seed: string): string {
  const h1 = simpleHash(seed);
  const h2 = simpleHash(`${seed}-nonce-${seed.length}`);
  return `0x${h1}${h2}`;
}

export function generateMerkleRoot(elements: string[]): string {
  if (elements.length === 0) {
    return `sha256:${simpleHash('empty-root').repeat(2)}`;
  }
  let currentLayer = elements.map(el => simpleHash(el));
  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left;
      nextLayer.push(simpleHash(`${left}:${right}`));
    }
    currentLayer = nextLayer;
  }
  return `sha256:${currentLayer[0]}${simpleHash(currentLayer[0])}`;
}

export function calculateProgress(current: number, target: number): { percent: number; isComplete: boolean } {
  if (target <= 0) return { percent: 0, isComplete: false };
  const raw = Math.round((current / target) * 100);
  const percent = Math.min(Math.max(raw, 0), 100);
  return {
    percent,
    isComplete: current >= target,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run versions/v2/src/utils/crypto.test.ts`
Expected: PASS (4 tests passed).

- [ ] **Step 6: Commit**

```bash
git add versions/v2/src/types/index.ts versions/v2/src/utils/crypto.ts versions/v2/src/utils/crypto.test.ts
git commit -m "feat(v2): add v2 domain models and cryptographic proof utilities"
```

---

### Task 3: Seed Data & MonasteryStore V2 Extension

**Files:**
- Create: `versions/v2/src/data/seedDataV2.ts`
- Modify: `versions/v2/src/context/MonasteryStore.tsx`
- Modify: `versions/v2/src/context/MonasteryStore.test.tsx`

**Interfaces:**
- Consumes: `types/index.ts`, `utils/crypto.ts`
- Produces: `useMonasteryStore()` providing `packages`, `purchases`, `proofBatches`, `userPurchases`, `createPackage()`, `purchasePackage()`, `uploadGivingProof()`, `addCommentToProof()`

- [ ] **Step 1: Create seed data in `versions/v2/src/data/seedDataV2.ts`**

Write `versions/v2/src/data/seedDataV2.ts` with 4 packages (`Winter Warmth & Rice Kit`, `Highland Student Study Pack`, `Elderly Healthcare & Herbal Pack`, `Clean Mountain Spring Water Filtration Bundle`), 2 proof batches with heartfelt photo galleries, initial community comments, and initial purchases.
```typescript
import { CharityPackage, GivingProofBatch, PackagePurchase } from '../types';

export const initialPackages: CharityPackage[] = [
  {
    id: 'pkg-winter-warmth',
    title: 'Winter Warmth & Rice Kit',
    description: 'Providing a 10kg sack of highland jasmine rice, thermal fleece blanket, and woolen beanie for families facing sub-zero winter temperatures in Ha Giang.',
    category: 'winter',
    unitPrice: 25,
    targetUnits: 100,
    fundedUnits: 82,
    distributedUnits: 60,
    itemsIncluded: ['10kg Jasmine Rice', 'Thermal Fleece Blanket', 'Woolen Winter Beanie', 'Insulated Thermal Socks'],
    coverImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&auto=format&fit=crop&q=80',
    bannerGradient: 'from-amber-700 via-orange-600 to-amber-900',
    createdByMonk: 'Ven. Thich Tam An',
    status: 'active',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'pkg-student-pack',
    title: 'Highland Student Study Pack',
    description: 'Essential school stationery, waterproof backpack, stainless steel thermal flask, and reading books for ethnic minority children walking 5km daily to school.',
    category: 'education',
    unitPrice: 18,
    targetUnits: 150,
    fundedUnits: 115,
    distributedUnits: 75,
    itemsIncluded: ['Waterproof School Backpack', 'Set of 10 Ruled Notebooks', 'Pencil Case & Pens', '500ml Insulated Water Flask'],
    coverImageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&auto=format&fit=crop&q=80',
    bannerGradient: 'from-sky-700 via-blue-600 to-indigo-900',
    createdByMonk: 'Ven. Thich Dao Quang',
    status: 'active',
    createdAt: '2026-09-05T09:30:00Z',
  },
  {
    id: 'pkg-elderly-care',
    title: 'Elderly Healthcare & Herbal Pack',
    description: 'Relief balm, blood pressure monitor checkup, medicated warming patches, and nutritious lotus cereal for elderly solitary villagers.',
    category: 'medical',
    unitPrice: 30,
    targetUnits: 80,
    fundedUnits: 80,
    distributedUnits: 80,
    itemsIncluded: ['Medicated Herbal Balms', 'Warming Joint Patches', 'Nutritious Lotus Cereal (2kg)', 'Multivitamin Minerals (2 mo)'],
    coverImageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=900&auto=format&fit=crop&q=80',
    bannerGradient: 'from-emerald-700 via-teal-600 to-emerald-900',
    createdByMonk: 'Ven. Thich Tam An',
    status: 'completed',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'pkg-clean-water',
    title: 'Clean Mountain Water Filtration Kit',
    description: 'Gravity-fed ceramic water filter system providing 15 liters/day of pathogen-free drinking water for families relying on untreated limestone stream runoffs.',
    category: 'emergency',
    unitPrice: 40,
    targetUnits: 50,
    fundedUnits: 28,
    distributedUnits: 0,
    itemsIncluded: ['20L Food-Grade Dual Bucket System', '0.2 Micron Ceramic Candle', 'Brass Dispenser Spigot', 'Cleaning Scrub Pad'],
    coverImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=900&auto=format&fit=crop&q=80',
    bannerGradient: 'from-cyan-700 via-teal-600 to-blue-900',
    createdByMonk: 'Ven. Thich Tri Giac',
    status: 'active',
    createdAt: '2026-09-12T14:15:00Z',
  },
];

export const initialProofBatches: GivingProofBatch[] = [
  {
    id: 'proof-winter-batch-1',
    packageId: 'pkg-winter-warmth',
    packageTitle: 'Winter Warmth & Rice Kit',
    unitsDistributed: 60,
    location: 'Dong Van Highland Village, Ha Giang',
    missionReport: 'Monastery stewards climbed to Lung Cu commune amidst 4°C fog. 60 elderly residents and single-parent households received blankets and rice sacks directly from monks.',
    heartfeltPhotos: [
      {
        id: 'photo-w1',
        url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=80',
        caption: 'Handing the winter warmth bundle to grandmother Sung Thi May (84).',
        beneficiaryNote: 'Grandmother May lives alone on the stone mountain slope. She said this blanket will keep her warm through frost season.',
      },
      {
        id: 'photo-w2',
        url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=900&auto=format&fit=crop&q=80',
        caption: 'Monks and villagers unloading 60 sacks of rice from the transport truck.',
        beneficiaryNote: 'Villagers carried sacks across the suspension bridge with radiant smiles.',
      },
      {
        id: 'photo-w3',
        url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&auto=format&fit=crop&q=80',
        caption: 'Little children trying on woolen beanies in the commune courtyard.',
        beneficiaryNote: 'Warm heads and joyful laughter despite freezing morning drizzle.',
      },
    ],
    distributionDate: '2026-09-15',
    attestingMonk: 'Ven. Thich Tam An',
    distributionTxHash: '0x8f2d4e9c7b1a305f6e8d2c4b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a10',
    merkleRootHash: 'sha256:7c9e1b3d5f7a902b4d6e8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e',
    blockNumber: 18942,
    comments: [
      {
        id: 'cmt-1',
        campaignId: 'proof-winter-batch-1',
        authorName: 'Ven. Thich Tam An',
        authorRole: 'monk',
        monkBadge: 'Sangha Steward',
        commentText: 'Amitabha. Seeing grandmother May smile wrapped in her new fleece blanket touched our hearts deeply.',
        createdAt: '2026-09-15T16:20:00Z',
      },
      {
        id: 'cmt-2',
        campaignId: 'proof-winter-batch-1',
        authorName: 'Nguyen Duc Thao',
        authorRole: 'devotee',
        commentText: 'Rejoicing in this boundless merit! So grateful to the venerable monks for braving the mountain fog.',
        createdAt: '2026-09-16T08:14:00Z',
      },
    ],
  },
  {
    id: 'proof-student-batch-1',
    packageId: 'pkg-student-pack',
    packageTitle: 'Highland Student Study Pack',
    unitsDistributed: 75,
    location: 'Nam Dam Primary School, Quan Ba',
    missionReport: 'Delivered 75 complete study kits and thermal flasks to young students starting their autumn semester.',
    heartfeltPhotos: [
      {
        id: 'photo-s1',
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=80',
        caption: 'Students proudly raising their new backpacks and notebooks.',
        beneficiaryNote: 'Head teacher shared that textbook retention improves by 80% with waterproof bags during monsoon rains.',
      },
      {
        id: 'photo-s2',
        url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&auto=format&fit=crop&q=80',
        caption: 'Venerable Dao Quang sharing a Buddhist children story on mindfulness.',
        beneficiaryNote: 'The classroom resonated with youthful enthusiasm and gratitude.',
      },
    ],
    distributionDate: '2026-09-18',
    attestingMonk: 'Ven. Thich Dao Quang',
    distributionTxHash: '0x3c7e9a1b5d6f802e4c6a8b0d2f4e6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f',
    merkleRootHash: 'sha256:4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e7c9e1b',
    blockNumber: 18985,
    comments: [
      {
        id: 'cmt-3',
        campaignId: 'proof-student-batch-1',
        authorName: 'Ven. Thich Dao Quang',
        authorRole: 'monk',
        monkBadge: 'Dharma Teacher',
        commentText: 'Education is the bridge out of hardship. May these young souls flourish in wisdom.',
        createdAt: '2026-09-18T18:00:00Z',
      },
    ],
  },
];

export const initialPurchases: PackagePurchase[] = [
  {
    id: 'pur-101',
    packageId: 'pkg-winter-warmth',
    packageTitle: 'Winter Warmth & Rice Kit',
    unitsBought: 2,
    unitPrice: 25,
    totalAmount: 50,
    donorName: 'Tran Minh Tri',
    isAnonymous: false,
    dedicationNote: 'Dedicated to the peace and longevity of my parents.',
    txHash: '0x8a92f038c41bbd93c78d523ecab710a9f0227bb30a1de458c031d6837be70491',
    blockNumber: 18910,
    timestamp: '2026-09-14T09:20:00Z',
    fulfillmentStatus: 'fulfilled_with_proof',
    linkedProofBatchId: 'proof-winter-batch-1',
  },
  {
    id: 'pur-102',
    packageId: 'pkg-student-pack',
    packageTitle: 'Highland Student Study Pack',
    unitsBought: 3,
    unitPrice: 18,
    totalAmount: 54,
    donorName: 'Anonymous Devotee',
    isAnonymous: true,
    dedicationNote: 'May all children have the chance to read and dream.',
    txHash: '0x5b32f148e61bbd83c78d523ecab710a9f0227bb30a1de458c031d6837be70882',
    blockNumber: 18960,
    timestamp: '2026-09-17T11:45:00Z',
    fulfillmentStatus: 'fulfilled_with_proof',
    linkedProofBatchId: 'proof-student-batch-1',
  },
];
```

- [ ] **Step 2: Write failing unit test for MonasteryStore V2 actions**

Add tests to `versions/v2/src/context/MonasteryStore.test.tsx`:
```typescript
import { renderHook, act } from '@testing-library/react';
import { MonasteryProvider, useMonasteryStore } from './MonasteryStore';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MonasteryProvider>{children}</MonasteryProvider>
);

describe('MonasteryStore V2 Package & Proof Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows creating a new charity package by monk steward', () => {
    const { result } = useMonasteryStore({ wrapper });

    act(() => {
      result.current.unlockSteward('1080');
    });

    let newPkg;
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
    expect(result.current.packages.some(p => p.id === newPkg.id)).toBe(true);
  });

  it('allows a devotee to purchase a package and records user impact', () => {
    const { result } = useMonasteryStore({ wrapper });
    const targetPkg = result.current.packages[0];
    const initialFunded = targetPkg.fundedUnits;

    let purchase;
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
    const updatedPkg = result.current.packages.find(p => p.id === targetPkg.id);
    expect(updatedPkg?.fundedUnits).toBe(initialFunded + 2);

    // Check userPurchases includes this purchase
    expect(result.current.userPurchases.some(p => p.id === purchase.id)).toBe(true);
  });

  it('allows uploading a proof of giving and updates linked package & purchases', () => {
    const { result } = useMonasteryStore({ wrapper });
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

    let proofBatch;
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
    const updatedPkg = result.current.packages.find(p => p.id === targetPkg.id);
    expect(updatedPkg?.distributedUnits).toBeGreaterThanOrEqual(10);
  });

  it('allows adding community comments to a proof batch', () => {
    const { result } = useMonasteryStore({ wrapper });
    const proofId = result.current.proofBatches[0].id;

    act(() => {
      result.current.addCommentToProof(proofId, {
        authorName: 'Lotus Disciple',
        authorRole: 'devotee',
        commentText: 'Sadhu Sadhu Sadhu! Touching proof.',
      });
    });

    const updatedProof = result.current.proofBatches.find(b => b.id === proofId);
    expect(updatedProof?.comments.some(c => c.commentText.includes('Sadhu'))).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify failure**

Run: `npx vitest run versions/v2/src/context/MonasteryStore.test.tsx`
Expected: FAIL due to missing functions `createPackage`, `purchasePackage`, etc.

- [ ] **Step 4: Update `versions/v2/src/context/MonasteryStore.tsx`**

Update `MonasteryStoreContextType` and `MonasteryProvider` to maintain:
- `packages: CharityPackage[]` (persisted in `STORAGE_KEY_PACKAGES = 'lotus_packages_v2'`)
- `purchases: PackagePurchase[]` (persisted in `STORAGE_KEY_PURCHASES = 'lotus_purchases_v2'`)
- `userPurchases: PackagePurchase[]` (persisted in `STORAGE_KEY_USER_PURCHASES = 'lotus_user_purchases_v2'`)
- `proofBatches: GivingProofBatch[]` (persisted in `STORAGE_KEY_PROOF_BATCHES = 'lotus_proof_batches_v2'`)
- Methods:
  - `createPackage(payload: CreatePackagePayload): CharityPackage`
  - `purchasePackage(payload: PurchasePackagePayload): PackagePurchase`
  - `uploadGivingProof(payload: UploadProofPayload): GivingProofBatch`
  - `addCommentToProof(batchId: string, comment: Omit<CampaignComment, 'id' | 'campaignId' | 'createdAt'>): boolean`
  - `resetStore(): void` (resets to initial V2 seed data)

- [ ] **Step 5: Run tests to verify pass**

Run: `npx vitest run versions/v2/src/context/MonasteryStore.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add versions/v2/src/data/seedDataV2.ts versions/v2/src/context/MonasteryStore.tsx versions/v2/src/context/MonasteryStore.test.tsx
git commit -m "feat(v2): implement seed data and MonasteryStore v2 state management"
```

---

### Task 4: Tab 1 — Charity Packages Marketplace (Single-Card Swipeable Carousel & Buy Modal)

**Files:**
- Create: `versions/v2/src/components/market/PackageCard.tsx`
- Create: `versions/v2/src/components/market/PackageBuyModal.tsx`
- Create: `versions/v2/src/components/market/MarketplaceCarousel.tsx`
- Create: `versions/v2/src/components/market/MarketplaceCarousel.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `CharityPackage`, `calculateProgress()`
- Produces: `MarketplaceCarousel` component displaying 1 package at a time with swipe gesture support, and `PackageBuyModal` for instant purchase with cryptographic TX receipt.

- [ ] **Step 1: Write failing tests for Marketplace Carousel and Package Card**

Create `versions/v2/src/components/market/MarketplaceCarousel.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MarketplaceCarousel } from './MarketplaceCarousel';
import { MonasteryProvider } from '../../context/MonasteryStore';
import { LanguageProvider } from '../../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <MonasteryProvider>{ui}</MonasteryProvider>
    </LanguageProvider>
  );
};

describe('MarketplaceCarousel (Tab 1)', () => {
  it('renders exactly one package card at a time on screen', () => {
    renderWithProviders(<MarketplaceCarousel />);
    
    // Shows package title of first package
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
    // Does not show second package in active view
    expect(screen.queryByText('Highland Student Study Pack')).not.toBeInTheDocument();
    // Indicator shows "Package 1 of 4"
    expect(screen.getByText(/Package 1 of 4/i)).toBeInTheDocument();
  });

  it('navigates to next package when next arrow is clicked', () => {
    renderWithProviders(<MarketplaceCarousel />);
    
    const nextBtn = screen.getByRole('button', { name: /next package/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Highland Student Study Pack')).toBeInTheDocument();
    expect(screen.getByText(/Package 2 of 4/i)).toBeInTheDocument();
  });

  it('navigates when swipe gesture is simulated', () => {
    const { container } = renderWithProviders(<MarketplaceCarousel />);
    const swipeArea = container.querySelector('.swipe-container');
    expect(swipeArea).not.toBeNull();

    // Simulate swipe left (next)
    fireEvent.touchStart(swipeArea!, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(swipeArea!, { changedTouches: [{ clientX: 100 }] });

    expect(screen.getByText('Highland Student Study Pack')).toBeInTheDocument();
  });

  it('opens purchase modal when Sponsor button is clicked', () => {
    renderWithProviders(<MarketplaceCarousel />);
    const sponsorBtn = screen.getByRole('button', { name: /sponsor this package/i });
    fireEvent.click(sponsorBtn);

    expect(screen.getByText(/Sponsor Winter Warmth & Rice Kit/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25 per package/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run versions/v2/src/components/market/MarketplaceCarousel.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `PackageCard.tsx`**

Create `versions/v2/src/components/market/PackageCard.tsx`:
- Render package cover image with category chip.
- Title and description.
- Item tags breakdown (e.g. pills for `10kg Jasmine Rice`, `Thermal Blanket`).
- Dual progress bars:
  1. Funded: `fundedUnits / targetUnits` with amber bar.
  2. Distributed with Photo Proof: `distributedUnits / targetUnits` with green bar and check icon.
- Price badge: `$25 / kit`.
- "Sponsor This Package" CTA button triggering `onOpenBuy(package)`.

- [ ] **Step 4: Implement `PackageBuyModal.tsx`**

Create `versions/v2/src/components/market/PackageBuyModal.tsx`:
- Quantity selector (+, -, presets: 1, 2, 5, 10).
- Donor Name input and "Remain Anonymous" checkbox.
- Dedication / Prayer note textarea.
- Total calculation (`units * unitPrice`).
- Action: "Confirm Sponsorship & Record On-Chain".
- Post-purchase confirmation state: displays instant cryptographic TX Hash (`0x...`), Block Number, and a "View Blessing Certificate" button with confetti effect.

- [ ] **Step 5: Implement `MarketplaceCarousel.tsx`**

Create `versions/v2/src/components/market/MarketplaceCarousel.tsx`:
- State: `currentIndex` (0 to `packages.length - 1`).
- Touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`) with 50px delta threshold.
- Header with progress counter (`Package X of N`), dot indicators.
- Left and right chevron navigation buttons.
- Connect with `PackageBuyModal`.

- [ ] **Step 6: Run tests to verify pass**

Run: `npx vitest run versions/v2/src/components/market/MarketplaceCarousel.test.tsx`
Expected: PASS (4 tests passed).

- [ ] **Step 7: Commit**

```bash
git add versions/v2/src/components/market/
git commit -m "feat(v2): implement single-package swipeable carousel and purchase modal"
```

---

### Task 5: Tab 2 — On-Chain Proof Explorer (Screen-Filling Cards, 50% Drawers & Personal Impact Tracker)

**Files:**
- Create: `versions/v2/src/components/proof/CampaignProofCard.tsx`
- Create: `versions/v2/src/components/proof/PersonalPurchases.tsx`
- Create: `versions/v2/src/components/proof/ProofExplorer.tsx`
- Create: `versions/v2/src/components/proof/ProofExplorer.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `GivingProofBatch`, `PackagePurchase`
- Produces: `ProofExplorer` component containing screen-filling campaign cards with horizontal photo swipe, mutually exclusive 50% bottom sheet drawers (`ℹ️` vs `💬`), and private personal purchase tracker.

- [ ] **Step 1: Write failing tests for Proof Explorer**

Create `versions/v2/src/components/proof/ProofExplorer.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProofExplorer } from './ProofExplorer';
import { MonasteryProvider } from '../../context/MonasteryStore';
import { LanguageProvider } from '../../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <MonasteryProvider>{ui}</MonasteryProvider>
    </LanguageProvider>
  );
};

describe('ProofExplorer (Tab 2)', () => {
  it('renders screen-filling campaign proof card with background photo and details', () => {
    renderWithProviders(<ProofExplorer />);
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
    expect(screen.getByText(/Dong Van Highland Village/i)).toBeInTheDocument();
    expect(screen.getByText(/Block #18942/i)).toBeInTheDocument();
  });

  it('toggles Details 50% drawer when info icon is clicked and collapses on second click', () => {
    renderWithProviders(<ProofExplorer />);
    const infoBtn = screen.getByRole('button', { name: /toggle proof details/i });

    // Open Details
    fireEvent.click(infoBtn);
    expect(screen.getByText(/Mission Report & Merkle Seal/i)).toBeInTheDocument();
    expect(screen.getByText(/sha256:/i)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(infoBtn);
    expect(screen.queryByText(/Mission Report & Merkle Seal/i)).not.toBeInTheDocument();
  });

  it('enforces mutual exclusivity: opening comments collapses details drawer', () => {
    renderWithProviders(<ProofExplorer />);
    const infoBtn = screen.getByRole('button', { name: /toggle proof details/i });
    const commentBtn = screen.getByRole('button', { name: /toggle comments/i });

    // Open details
    fireEvent.click(infoBtn);
    expect(screen.getByText(/Mission Report & Merkle Seal/i)).toBeInTheDocument();

    // Click comments
    fireEvent.click(commentBtn);
    expect(screen.queryByText(/Mission Report & Merkle Seal/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Sangha Reflections & Community Notes/i)).toBeInTheDocument();
  });

  it('allows posting a comment in the comments bottom sheet', () => {
    renderWithProviders(<ProofExplorer />);
    const commentBtn = screen.getByRole('button', { name: /toggle comments/i });
    fireEvent.click(commentBtn);

    const input = screen.getByPlaceholderText(/share a reflection or rejoice/i);
    const postBtn = screen.getByRole('button', { name: /post/i });

    fireEvent.change(input, { target: { value: 'Wonderful compassionate effort!' } });
    fireEvent.click(postBtn);

    expect(screen.getByText('Wonderful compassionate effort!')).toBeInTheDocument();
  });

  it('switches between Public Proofs and My Purchased Packages view', () => {
    renderWithProviders(<ProofExplorer />);
    const myImpactTab = screen.getByRole('tab', { name: /my purchased packages/i });
    fireEvent.click(myImpactTab);

    expect(screen.getByText(/Your Personal Giving Tracker/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run versions/v2/src/components/proof/ProofExplorer.test.tsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `CampaignProofCard.tsx`**

Create `versions/v2/src/components/proof/CampaignProofCard.tsx`:
- Container with `h-[calc(100vh-220px)] min-h-[580px] w-full relative overflow-hidden rounded-3xl`.
- Full-bleed background photo with horizontal swipe detection (`currentPhotoIndex`).
- Gradient overlays for text contrast.
- Top overlay: Campaign title, units delivered badge, location badge, block height.
- Photo indicator dots and caption banner at bottom when drawers are closed.
- Floating right action dock (`absolute right-4 bottom-6 flex flex-col gap-3 z-30`):
  - `ℹ️ Details` button.
  - `💬 Comments` button (with badge count of comments).
- 50% Bottom Sheet Drawer (`absolute bottom-0 left-0 right-0 h-[50%] bg-stone-900/95 backdrop-blur-xl border-t border-amber-500/30 rounded-t-3xl p-5 z-20 overflow-y-auto`):
  - When `activeDrawer === 'details'`: Shows attesting monk, mission narrative, beneficiary quote, on-chain TX hash, Merkle root hash with copy button, and close drawer chevron.
  - When `activeDrawer === 'comments'`: Shows comments list, author badges (Monk vs Devotee), input field, and Post button.
  - Mutual exclusivity: toggling comments sets `activeDrawer = activeDrawer === 'comments' ? null : 'comments'`, which automatically closes details.

- [ ] **Step 4: Implement `PersonalPurchases.tsx`**

Create `versions/v2/src/components/proof/PersonalPurchases.tsx`:
- Displays devotee's private purchases (`userPurchases`).
- Empty state: "No packages sponsored yet in this session. Visit the Charity Packages tab to sponsor your first bundle."
- Each item card shows:
  - Package title and thumbnail.
  - Units sponsored & total USD.
  - Dedication note.
  - Simulated TX hash (`0x...`) with block number.
  - Fulfillment status badge:
    - `Queued for Monk Trek`: Monk team is preparing goods.
    - `Fulfilled & Delivered with Photo Proof`: Badge with link to jump to the photo proof batch.

- [ ] **Step 5: Implement `ProofExplorer.tsx`**

Create `versions/v2/src/components/proof/ProofExplorer.tsx`:
- Sub-navigation header with segmented toggle: `Public Field Proofs` (with badge count) and `🌸 My Purchased Packages` (with user purchase count).
- Public view: Vertical snap-scrolling feed (`flex flex-col gap-6 snap-y snap-mandatory overflow-y-auto`).
- Private view: `PersonalPurchases` component.

- [ ] **Step 6: Run tests to verify pass**

Run: `npx vitest run versions/v2/src/components/proof/ProofExplorer.test.tsx`
Expected: PASS (5 tests passed).

- [ ] **Step 7: Commit**

```bash
git add versions/v2/src/components/proof/
git commit -m "feat(v2): implement screen-filling on-chain proof explorer with 50% bottom sheet drawers"
```

---

### Task 6: Tab 3 — Monk Steward Portal (PIN 1080, Create Package & Upload Proof Modals)

**Files:**
- Create: `versions/v2/src/components/steward/CreatePackageModal.tsx`
- Create: `versions/v2/src/components/steward/UploadProofModal.tsx`
- Modify: `versions/v2/src/components/steward/StewardPortal.tsx`
- Create: `versions/v2/src/components/steward/StewardPortal.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `CreatePackagePayload`, `UploadProofPayload`
- Produces: `StewardPortal` component with PIN authentication (1080), package creation modal, and field distribution proof upload modal.

- [ ] **Step 1: Write failing tests for Steward Portal V2**

Create `versions/v2/src/components/steward/StewardPortal.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StewardPortal } from './StewardPortal';
import { MonasteryProvider } from '../../context/MonasteryStore';
import { LanguageProvider } from '../../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <MonasteryProvider>{ui}</MonasteryProvider>
    </LanguageProvider>
  );
};

describe('StewardPortal (Tab 3)', () => {
  it('demands PIN 1080 when locked and unlocks upon correct entry', () => {
    renderWithProviders(<StewardPortal />);
    expect(screen.getByText(/Monk Steward Access/i)).toBeInTheDocument();

    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    expect(screen.getByText(/Monastery Steward Workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ create charity package/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload proof of giving/i })).toBeInTheDocument();
  });

  it('rejects incorrect PIN entry', () => {
    renderWithProviders(<StewardPortal />);
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    expect(screen.getByText(/incorrect pin/i)).toBeInTheDocument();
  });

  it('opens Create Package modal and adds new package', () => {
    renderWithProviders(<StewardPortal />);
    // Unlock
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    // Click create package
    fireEvent.click(screen.getByRole('button', { name: /\+ create charity package/i }));
    expect(screen.getByText(/Create New Charity Package/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/package title/i), { target: { value: 'Flood Relief Pack' } });
    fireEvent.change(screen.getByLabelText(/unit price/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/target units/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/items included/i), { target: { value: 'Dry Rations, Water Purifier, First Aid' } });

    fireEvent.click(screen.getByRole('button', { name: /publish package/i }));
    expect(screen.getByText('Flood Relief Pack')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run versions/v2/src/components/steward/StewardPortal.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `CreatePackageModal.tsx`**

Create `versions/v2/src/components/steward/CreatePackageModal.tsx`:
- Inputs: Title, Category (dropdown: `winter`, `education`, `medical`, `food`, `emergency`), Unit Price (USD), Target Units Quota, Items Included (comma-separated list), Description, Cover Image URL (or preset selector).
- Validation: Non-empty title, price > 0, units > 0.
- Submits to `createPackage()`.

- [ ] **Step 4: Implement `UploadProofModal.tsx`**

Create `versions/v2/src/components/steward/UploadProofModal.tsx`:
- Package selector dropdown (shows packages with pending deliveries).
- Inputs: Units Distributed, Village Location, Attesting Monk Name, Field Mission Report Narrative.
- Photo attachment manager: allows adding heartfelt photo URLs, captions, and beneficiary quotes.
- Cryptographic sealing indicator: preview of generated Merkle root and distribution transaction hash.
- Submits to `uploadGivingProof()`.

- [ ] **Step 5: Update `StewardPortal.tsx`**

Update `versions/v2/src/components/steward/StewardPortal.tsx`:
- Integrates PIN lock/unlock with default PIN `1080`.
- Dashboard metrics: Active Packages, Total Units Funded, Total Units Distributed with On-Chain Proof.
- Action buttons: `+ Create Charity Package` and `📸 Upload Proof of Giving`.
- List of managed packages with status badges and quick action to upload proof directly for a package.
- Lock portal button.

- [ ] **Step 6: Run tests to verify pass**

Run: `npx vitest run versions/v2/src/components/steward/StewardPortal.test.tsx`
Expected: PASS (3 tests passed).

- [ ] **Step 7: Commit**

```bash
git add versions/v2/src/components/steward/
git commit -m "feat(v2): implement monk steward portal with package creation and proof upload"
```

---

### Task 7: 3-Tab Bottom Navigation, App Shell Integration, & Full Test Verification

**Files:**
- Modify: `versions/v2/src/components/common/BottomNav.tsx`
- Modify: `versions/v2/src/components/common/Header.tsx`
- Modify: `versions/v2/src/App.tsx`
- Modify: `versions/v2/src/App.test.tsx`
- Modify: `versions/v2/src/App.integration.test.tsx`

**Interfaces:**
- Consumes: `MarketplaceCarousel`, `ProofExplorer`, `StewardPortal`, `MonasteryProvider`
- Produces: Integrated 3-tab application shell

- [ ] **Step 1: Write integration tests for 3-Tab V2 App Shell**

Update `versions/v2/src/App.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('Charity App V2 Shell & Navigation', () => {
  it('renders the 3 main tabs: Packages, Proof Explorer, and Monk Steward', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /charity packages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proof explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monk steward/i })).toBeInTheDocument();
    // Old prayer wall is removed
    expect(screen.queryByRole('button', { name: /prayer wall/i })).not.toBeInTheDocument();
  });

  it('switches between tabs cleanly', () => {
    render(<App />);

    // Default tab is packages
    expect(screen.getByText(/Winter Warmth & Rice Kit/i)).toBeInTheDocument();

    // Switch to Proof Explorer
    fireEvent.click(screen.getByRole('button', { name: /proof explorer/i }));
    expect(screen.getByText(/On-Chain Proof Explorer/i)).toBeInTheDocument();

    // Switch to Monk Steward
    fireEvent.click(screen.getByRole('button', { name: /monk steward/i }));
    expect(screen.getByText(/Monk Steward Access/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Update `BottomNav.tsx` to 3 tabs**

In `versions/v2/src/components/common/BottomNav.tsx`:
- Tab IDs:
  - `'market'` (Charity Packages, icon: `Gift` or `ShoppingBag`)
  - `'proof'` (Proof Explorer, icon: `CheckCircle2` or `Camera`)
  - `'steward'` (Monk Steward, icon: `Shield`)
- Remove `'prayerWall'` and `'sanctuary'` from navigation items.

- [ ] **Step 3: Update `Header.tsx`**

In `versions/v2/src/components/common/Header.tsx`:
- Show Lotus Grove Sanctuary branding with "v2.0 Packaged Giving" badge.
- Quick stats: Total Packages, Total Verified Proofs.
- Language switcher (EN / VI) and "Demo Reset" button.

- [ ] **Step 4: Update `App.tsx`**

In `versions/v2/src/App.tsx`:
- State: `activeTab: 'market' | 'proof' | 'steward'`.
- Render `Header`.
- Render tab contents:
  - `'market'`: `<MarketplaceCarousel />`
  - `'proof'`: `<ProofExplorer />`
  - `'steward'`: `<StewardPortal />`
- Render `BottomNav`.

- [ ] **Step 5: Run App unit and integration tests**

Run:
```bash
npx vitest run versions/v2/src/App.test.tsx versions/v2/src/App.integration.test.tsx
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add versions/v2/src/components/common/ versions/v2/src/App.tsx versions/v2/src/App.test.tsx versions/v2/src/App.integration.test.tsx
git commit -m "feat(v2): integrate 3-tab navigation and app shell"
```

---

### Task 8: Documentation, Build Verification, and Final V2 Release Check

**Files:**
- Create: `versions/v2/ARCHITECTURE.md`
- Test: Full test suite `npm test -- --run`
- Test: Build verification `npm run build`

**Interfaces:**
- Consumes: All V2 components
- Produces: Production build and release architecture documentation

- [ ] **Step 1: Write `versions/v2/ARCHITECTURE.md`**

Document the V2 architecture:
- Overview of Packaged Charity & On-Chain Proof of Giving.
- Data structures (`CharityPackage`, `GivingProofBatch`, `PackagePurchase`).
- Cryptographic hash and Merkle root generation.
- 3-tab layout and mutual exclusivity drawer behavior.
- Version isolation details.

- [ ] **Step 2: Run full test suite across the project**

Run command:
```bash
npm test -- --run
```
Expected: PASS (all tests in active version pass with 0 failures).

- [ ] **Step 3: Run production build**

Run command:
```bash
npm run build
```
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit and finalize**

```bash
git add versions/v2/ARCHITECTURE.md
git commit -m "docs(v2): add v2 architecture documentation and verify release build"
```
