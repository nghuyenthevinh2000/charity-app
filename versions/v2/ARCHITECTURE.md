# Lotus Sanctuary V2 Architecture Specification

## 1. Overview: Packaged Charity & On-Chain Proof of Giving

Lotus Sanctuary V2 introduces a revolutionary **Tangible Packaged Charity & On-Chain Proof of Giving** model. Moving away from abstract fund balances, V2 structures charitable contributions into discrete, tangible community packages (e.g., Winter Warmth Bundles, Medical Emergency kits, Scholastic Backpacks). 

Every contribution directly funds a specific package unit. Once distributed by monastic stewards in the field, tangible cryptographic proof — including GPS geotags, attesting monk signatures, heartfelt beneficiary notes, and cryptographic Merkle roots anchored on-chain — is permanently recorded and viewable by donors.

---

## 2. Core Data Models

The V2 type system (`src/types/index.ts`) defines three primary data structures:

### A. `CharityPackage`
Represents a tangible humanitarian or monastic relief package available for sponsorship.
```ts
export type PackageCategory = 'food' | 'education' | 'medical' | 'winter' | 'emergency';

export interface CharityPackage {
  id: string;
  title: string;
  description: string;
  category: PackageCategory;
  unitPrice: number;        // e.g., 250,000 VND per package
  targetUnits: number;      // Total units needed
  fundedUnits: number;      // Units currently funded by donors
  distributedUnits: number; // Units successfully distributed in the field
  itemsIncluded: string[];  // Item pills e.g. ["5kg Rice", "1L Soy Sauce", "1kg Salt"]
  coverImageUrl: string;
  bannerGradient: string;
  createdByMonk: string;
  status: 'active' | 'fully_funded' | 'completed';
  createdAt: string;
}
```

### B. `PackagePurchase`
Represents a devotee's sponsorship of one or more package units, recording transactional metadata, blockchain transaction hash, block number, and fulfillment status.
```ts
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
```

### C. `GivingProofBatch`
Represents field distribution proof submitted by monestsary stewards, sealed with a Merkle root hash.
```ts
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
```

---

## 3. Cryptographic Hash & Merkle Root Generation (`utils/crypto.ts`)

V2 implements a robust client-side cryptographic hashing engine to secure donations, transaction records, and distribution proofs:

- **`simpleHash(input: string): string`**: A dual-accumulator 32-bit FNV/Murmur-inspired hashing algorithm producing a deterministic 64-character hex string.
- **`generateTxHash(seed: string): string`**: Generates a cryptographically-styled transaction hash prefixed with `0x` (e.g., `0x8f9b...`).
- **`generateMerkleRoot(elements: string[]): string`**: Combines proof elements into pairwise hashed binary Merkle trees, returning a verifiable Merkle root prefixed with `sha256:` and concluding with a secondary integrity hash.
- **`calculateProgress(current: number, target: number)`**: Computes accurate percentage completion with boundary constraints `[0, 100]` and boolean completion flags.

---

## 4. 3-Tab UI/UX Architecture

The application layout is organized into 3 primary tabs managed via state in `MonasteryStore` and `Navigation`:

### Tab 1: Sanctuary Home (Tangible Marketplace Carousel)
- **Swipeable Carousel (`MarketplaceCarousel.tsx`)**: Displays active charitable packages with rich imagery, badge categories, and price tags.
- **Item Pills**: Visual tags showing exact contents included in each package.
- **Dual Progress Bars**: Separately tracks **Funded Units** (sponsorship progress) vs **Distributed Units** (field fulfillment progress).
- **Offering Modal (`OfferingModal.tsx`)**: Enables devotees to select unit quantities, attach optional dedication notes or anonymous status, and complete sponsorships.

### Tab 2: Proof & Transparency Hub (Screen-Filling Campaign Cards)
- **Screen-Filling Proof Cards (`CampaignProofCard.tsx`)**: Designed with height `calc(100vh - 220px)` for immersive viewing.
- **Horizontal Photo Swipe**: Swipeable carousel of heartfelt beneficiary photos with captions and direct quotes.
- **Floating Action Dock**: Floating button dock providing quick triggers for drawer exploration.
- **50% Bottom Sheet Drawers (Details & Comments)**:
  - **Mutual Exclusivity**: Opening the Details drawer automatically closes the Comments drawer (and vice versa) to prevent screen clutter.
  - **Details Drawer**: Displays cryptographic Merkle root hash, attesting monk badge, location, block number, and one-click clipboard copy.
  - **Comments Drawer**: Live community dialogue where devotees and monastics exchange reflections and gratitude.
- **Private Personal Impact Tracker (`PersonalPurchases.tsx`)**: Devotees can toggle between public proof feeds and their personal encrypted purchase history, tracking their direct humanitarian footprint.

### Tab 3: Monk Steward Portal (`StewardPortal.tsx`)
- **PIN Protected Gate**: Requires PIN `1080` (with modal challenge) to access administrative capabilities.
- **Package Creation (`CreatePackageModal.tsx`)**: Allows monastic stewards to launch new tangible charity campaigns specifying unit prices, target quantities, and item lists.
- **Merkle-Sealed Proof Uploads (`UploadProofModal.tsx`)**: Enables stewards to log field distributions, attach geo-locations, upload photo proofs, and generate cryptographic Merkle roots anchoring the mission on-chain.

---

## 5. Version Isolation & Build Architecture

- **Workspace Version Manager**: V2 is isolated within `versions/v2` with its own `package.json`, dependencies (`vite`, `react`, `tailwindcss`, `vitest`), and build configuration (`vite.config.ts`).
- **Zero-Config Testing**: Comprehensive unit and integration test suites run via `npm test -- --run` covering stores, cryptographic functions, UI components, and localization.
- **Clean Production Build**: Production bundle is generated via `npm run build` with optimized asset chunking.
