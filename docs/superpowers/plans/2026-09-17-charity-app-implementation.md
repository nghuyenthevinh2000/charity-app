# Zen Monastery Charity & UTXO Transparency Mobile Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Zen Buddhist charity web app featuring a 4-tab mobile navigation, modular cause fund campaign cards with dedicated offering buttons, a unified UTXO blockchain-style transparency ledger with tap-to-inspect receipts, a prayer wall with monk-devotee community dialogue, a monk steward admin portal for logging expenses and spinning off new funds, and full bilingual support (Vietnamese & English) driven by decoupled JSON translation dictionaries.

**Architecture:** A client-side React 18 SPA built with Vite and Tailwind CSS. State is managed reactively via a custom hook store backed by `localStorage` and pre-populated with authentic monastery seed data. Localization is handled through an extensible JSON-driven `useTranslation` hook (`en.json` and `vi.json`).

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Vitest, React Testing Library.

**Spec:** [`docs/superpowers/specs/2026-09-17-charity-app-design.md`](file:///Users/thevinhnguyen/Documents/computer-science/projects/app-factory/projects/charity-app/docs/superpowers/specs/2026-09-17-charity-app-design.md)

## Global Constraints
- Target platform: Mobile-First Web Application (max-w-md viewport on desktop, full screen on mobile).
- Navigation: Exactly 4 bottom tabs: `Sanctuary` (Home), `Transparency` (UTXO Ledger), `Prayer Wall` (Intentions & Sangha Chat), `Steward` (Monk Admin).
- Giving UX: No standalone donation tab; donations occur contextually via an `OfferingModal` launched from each cause fund card on Tab 1.
- Cause Fund Groups: Each fund card on Tab 1 contains title, verified status badge (`Verified by Abbot ✓`), fulfillment progress bar, deadline tracker, and a dedicated `Offer to this Cause` button directly beneath it.
- UTXO Transparency: For any selected fund, displays visual transaction flow (Inputs $\rightarrow$ Pool Batch $\rightarrow$ Outputs: Spent + Unspent Change). Tapping any spent output slides up the bottom-sheet receipt inspection drawer with merchant, items, purpose, and receipt photo.
- Community Dialogue: Tab 3 supports threaded conversations between monks (verified saffron badge) and devotees on each prayer card.
- Steward Admin: Includes `+ Log Expense` (with receipt photo) and `+ Launch New Cause Fund` (instant spin-off to Tab 1).
- i18n: All user-facing strings live in `src/locales/en.json` and `src/locales/vi.json`, toggled via a header `[VI | EN]` button.

---

### Task 1: Project Scaffolding & Tooling Setup

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/index.css`, `src/main.tsx`, `src/App.tsx`, `vitest.config.ts`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: Working React 18 + Vite + TypeScript + Tailwind + Vitest development and test environment.

- [ ] **Step 1: Write initial configuration files**

Write `package.json`:
```json
{
  "name": "charity-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^1.16.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

Write `tailwind.config.js` with zen palette:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F3EDE2',
          300: '#EAE3D2',
        },
        saffron: {
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        sage: {
          50: '#F0FDF4',
          500: '#10B981',
          600: '#059669',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

Write `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 2: Install dependencies & verify failing smoke test**

Run: `npm install`
Write `src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App smoke test', () => {
  it('renders app title', () => {
    render(<App />);
    expect(screen.getByText(/Lotus Grove/i)).toBeInTheDocument();
  });
});
```
Run: `npm test`
Expected: FAIL (App.tsx does not exist yet).

- [ ] **Step 3: Implement minimal App.tsx and CSS**

Write `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #FAF7F2;
  color: #1F2937;
  margin: 0;
  padding: 0;
}
```

Write `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-parchment-100 flex flex-col items-center">
      <h1>Lotus Grove Sanctuary</h1>
    </div>
  );
}
```

- [ ] **Step 4: Run tests and verify PASS**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig*.json vite.config.ts vitest.config.ts tailwind.config.js postcss.config.js index.html src/
git commit -m "chore: scaffold React Vite project with Tailwind, Vitest, and Zen design tokens"
```

---

### Task 2: Internationalization Engine & Decoupled JSON Dictionaries

**Files:**
- Create: `src/locales/en.json`, `src/locales/vi.json`, `src/context/LanguageContext.tsx`, `src/hooks/useTranslation.ts`
- Test: `src/context/LanguageContext.test.tsx`

**Interfaces:**
- Produces: `LanguageProvider`, `useTranslation() => { t, language, setLanguage }`.
- Keys schema: `common.*`, `sanctuary.*`, `transparency.*`, `prayerWall.*`, `steward.*`.

- [ ] **Step 1: Write failing i18n test**

Write `src/context/LanguageContext.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LanguageProvider, useTranslation } from './LanguageContext';

function TestConsumer() {
  const { t, language, setLanguage } = useTranslation();
  return (
    <div>
      <span data-testid="title">{t('common.appName')}</span>
      <span data-testid="lang">{language}</span>
      <button onClick={() => setLanguage('vi')}>Switch to VI</button>
      <button onClick={() => setLanguage('en')}>Switch to EN</button>
    </div>
  );
}

describe('LanguageContext', () => {
  it('defaults to English and switches to Vietnamese', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('title')).toHaveTextContent('Lotus Grove Sanctuary');
    fireEvent.click(screen.getByText('Switch to VI'));
    expect(screen.getByTestId('title')).toHaveTextContent('Tịnh Xá Sen Vàng');
    expect(screen.getByTestId('lang')).toHaveTextContent('vi');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/context/LanguageContext.test.tsx`
Expected: FAIL (LanguageContext does not exist).

- [ ] **Step 3: Create en.json, vi.json, and LanguageContext.tsx**

Write `src/locales/en.json`:
```json
{
  "common": {
    "appName": "Lotus Grove Sanctuary",
    "monasteryName": "Lotus Grove Vihara",
    "devoteeRole": "Devotee View",
    "stewardRole": "Steward / Monk View",
    "verifiedBadge": "Verified by Abbot ✓",
    "tabs": {
      "sanctuary": "Sanctuary",
      "transparency": "Transparency",
      "prayerWall": "Prayer Wall",
      "steward": "Steward"
    }
  },
  "sanctuary": {
    "dailyTeachingLabel": "Daily teaching reflection",
    "dailyTeachingQuote": "In giving, we find boundless peace",
    "activeCauses": "Active Cause Funds",
    "offerButton": "Offer to this Cause",
    "raisedOf": "{{current}} / {{target}} target ({{pct}}%)",
    "supporters": "{{count}} devotees offered",
    "daysRemaining": "⏳ {{days}} days remaining (Ends {{date}})",
    "recurringCycle": "🔄 Monthly Recurring: {{days}} days left"
  },
  "transparency": {
    "title": "UTXO Transparency Ledger",
    "subtitle": "Tap any spent output to inspect verified merchant receipts",
    "allFunds": "All Funds",
    "inputsHeader": "INPUTS (Donations)",
    "outputsHeader": "OUTPUTS (Spending & Change)",
    "spentLabel": "SPENT",
    "unspentChange": "UNSPENT CHANGE",
    "retainedInTreasury": "Retained in Treasury",
    "traceTitle": "My Offering Provenance Tracker",
    "tracePlaceholder": "Search by your donation TX Hash (e.g. 0x8e2...)",
    "traceButton": "Trace My Offering",
    "inspectionHeader": "Bill & Receipt Inspection",
    "payee": "PAYEE",
    "itemized": "ITEMIZED PURCHASES",
    "purpose": "PURPOSE",
    "receiptHash": "CRYPTOGRAPHIC PROOF",
    "verifiedSeal": "Verified by Monastery Kitchen Steward",
    "close": "Close Receipt"
  },
  "prayerWall": {
    "title": "Book of Intentions & Sangha",
    "subtitle": "Monks and devotees conversing in compassion and mindfulness",
    "filterAll": "All",
    "filterHealing": "Healing & Health",
    "filterMemorial": "In Loving Memory",
    "filterPeace": "Peace & Family",
    "filterMy": "My Prayers",
    "blessedStatus": "Blessed in Morning Chanting • 6:00 AM 🪷",
    "queuedStatus": "Queued for Morning Chanting",
    "rejoiceInMerit": "Rejoice in Merit",
    "conversations": "Active threaded conversation",
    "inputPlaceholder": "Write a compassionate message or question for monks...",
    "send": "Send Message"
  },
  "offeringModal": {
    "title": "Make an Offering & Dedication",
    "step1": "1. Cause & Amount",
    "step2": "2. Prayer Dedication",
    "step3": "3. Blessing Receipt",
    "amountLabel": "Select Offering Amount",
    "customAmount": "Custom Amount ($)",
    "donorName": "Your Name / Family Name",
    "donorAnonymous": "Keep offering anonymous on public wall",
    "intentionCategory": "Intention Category",
    "catHealing": "Health & Longevity (Cầu An)",
    "catMemorial": "In Loving Memory (Cầu Siêu)",
    "catPeace": "Peace & Gratitude (Cầu Bình An)",
    "intentionText": "Personal Prayer / Dedication Message",
    "intentionPlaceholder": "Write your prayer intention for the monks to chant...",
    "submit": "Submit Offering & Dedication",
    "close": "Complete & Return"
  },
  "steward": {
    "title": "Steward Portal",
    "authenticated": "Authenticated as Abbot / Steward",
    "treasuryTotal": "Total Available Reserves",
    "logExpense": "Log Expense",
    "launchFund": "Launch New Cause Fund",
    "chantingQueue": "Morning Chanting & Prayer Intentions",
    "reciteAndBless": "Recite & Bless 🪷",
    "blessedSuccess": "Blessed",
    "newFundTitle": "Launch New Cause Fund",
    "causeName": "Cause Name",
    "spiritualPurpose": "Spiritual Purpose / Description",
    "targetGoal": "Target Goal ($)",
    "deadlineDate": "Deadline Date",
    "categoryLabel": "Category",
    "createButton": "Launch Fund to Sanctuary"
  }
}
```

Write `src/locales/vi.json` with accurate Vietnamese terminology (*Tịnh Xá Sen Vàng, Minh bạch UTXO, Hóa đơn viện trợ, Cầu An, Cầu Siêu, v.v.*).
Implement `LanguageContext.tsx` and `useTranslation.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/context/LanguageContext.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/locales/ src/context/LanguageContext.tsx src/context/LanguageContext.test.tsx src/hooks/useTranslation.ts
git commit -m "feat: add internationalization engine with Vietnamese and English JSON dictionaries"
```

---

### Task 3: Domain Types, Storage & UTXO Invariant Engine

**Files:**
- Create: `src/types/index.ts`, `src/utils/utxo.ts`, `src/data/seedData.ts`
- Test: `src/utils/utxo.test.ts`

**Interfaces:**
- Produces:
  - Types: `Fund`, `DonationInput`, `SpentOutput`, `MonasteryTransaction`, `CommunityComment`.
  - Functions: `calculateProvenance(txHash, transactions, donations)`, `verifyUtxoInvariant(tx)`.
  - Preloaded initial seed datasets for authentic temple expenses and receipts.

- [ ] **Step 1: Write failing tests for UTXO calculation and invariant**

Write `src/utils/utxo.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { verifyUtxoInvariant, calculateProvenance } from './utxo';
import { MonasteryTransaction, DonationInput } from '../types';

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
    // If $40.28 was spent and $9.72 remains unspent
    const result = calculateProvenance('0x8e2', [/* mock tx */], [donation]);
    expect(result.found).toBe(true);
    expect(result.totalAmount).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/utils/utxo.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement domain types, UTXO functions, and seed data**

Write `src/types/index.ts`, `src/utils/utxo.ts`, and `src/data/seedData.ts`.
Ensure `verifyUtxoInvariant(tx)` checks:
`Math.abs(sumInputs - (tx.spentOutput.amount + tx.changeOutput.amount)) < 0.001`.
Ensure `calculateProvenance` walks transaction inputs to trace what percentage was allocated to spent outputs vs. remained in unspent change.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/utils/utxo.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/utils/utxo.ts src/utils/utxo.test.ts src/data/seedData.ts
git commit -m "feat: implement UTXO engine, domain models, and authentic monastery seed data"
```

---

### Task 4: Central Reactive Store & LocalStorage Persistence

**Files:**
- Create: `src/context/MonasteryStore.tsx`, `src/hooks/useMonasteryStore.ts`
- Test: `src/context/MonasteryStore.test.tsx`

**Interfaces:**
- Produces: `useMonasteryStore()` with methods:
  - `addDonation(fundId, amount, donorName, isAnonymous, prayerIntention)`
  - `logExpense(fundId, amount, merchant, items, purpose, receiptImageUrl)`
  - `launchNewFund(fundData)`
  - `blessPrayerIntention(donationId)`
  - `addCommentToPrayer(donationId, comment)`
  - `rejoiceMerit(donationId)`
  - `isStewardUnlocked`, `unlockSteward(pin)`, `lockSteward()`

- [ ] **Step 1: Write failing tests for store actions**

Write `src/context/MonasteryStore.test.tsx`:
```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MonasteryStoreProvider, useMonasteryStore } from './MonasteryStore';

describe('MonasteryStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows making a donation and updates fund balance', () => {
    const { result } = useMonasteryStoreHook();
    const initialBalance = result.current.funds.find(f => f.id === 'alms')?.currentBalance || 0;
    act(() => {
      result.current.addDonation({
        fundId: 'alms',
        amount: 50,
        donorName: 'Test Donor',
        isAnonymous: false,
        prayerIntention: {
          category: 'healing',
          dedicationText: 'May all be healthy',
          isPublic: true
        }
      });
    });
    const updated = result.current.funds.find(f => f.id === 'alms')?.currentBalance;
    expect(updated).toBe(initialBalance + 50);
  });

  it('allows monks to launch a new cause fund', () => {
    const { result } = useMonasteryStoreHook();
    act(() => {
      result.current.launchNewFund({
        name: 'Winter Robes Drive',
        description: 'Warm robes for winter retreat',
        category: 'special-drive',
        targetAmount: 2000,
        deadline: '2026-11-15'
      });
    });
    expect(result.current.funds.some(f => f.name === 'Winter Robes Drive')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/context/MonasteryStore.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement MonasteryStore with localStorage syncing**

Write `src/context/MonasteryStore.tsx` and `src/hooks/useMonasteryStore.ts`.
Initialize from `localStorage` or fallback to `seedData.ts`.
Ensure all state mutations save back to `localStorage`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/context/MonasteryStore.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/MonasteryStore.tsx src/context/MonasteryStore.test.tsx src/hooks/useMonasteryStore.ts
git commit -m "feat: implement reactive monastery state store with local persistence"
```

---

### Task 5: App Shell, Header & 4-Tab Bottom Navigation

**Files:**
- Create: `src/components/common/Header.tsx`, `src/components/common/BottomNav.tsx`, `src/components/modals/StewardPinModal.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/common/Navigation.test.tsx`

**Interfaces:**
- Consumes: `useTranslation()`, `useMonasteryStore()`.
- Produces: Top header with language pill `[VI | EN]`, Mode Switcher (Devotee / Steward), and 4-tab mobile navigation (`sanctuary`, `transparency`, `prayerWall`, `steward`).

- [ ] **Step 1: Write failing tests for navigation and role switching**

Write `src/components/common/Navigation.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('App Navigation & Role Switcher', () => {
  it('renders exactly 4 navigation tabs', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );
    expect(screen.getByRole('button', { name: /Sanctuary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transparency/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prayer Wall/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Steward/i })).toBeInTheDocument();
    // Confirms NO separate donate tab
    expect(screen.queryByRole('button', { name: /^Donate$/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/common/Navigation.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Header, BottomNav, StewardPinModal, and App.tsx**

Write `Header.tsx`:
- Golden lotus emblem with monastery name.
- Language switcher button `[🇻🇳 VI | 🇬🇧 EN]`.
- Role pill (`Devotee View` / `Steward View`). Tapping `Steward View` when locked prompts `StewardPinModal` (PIN `1080`).

Write `BottomNav.tsx`:
- 4 buttons with icons:
  - Sanctuary (`Home` icon)
  - Transparency (`FileText` / `Eye` icon)
  - Prayer Wall (`BookOpen` / `Lotus` icon)
  - Steward (`Shield` / `UserCheck` icon)

Update `src/App.tsx` with mobile container frame (`max-w-md w-full mx-auto min-h-screen bg-parchment-100 shadow-xl flex flex-col`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/common/Navigation.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/common/ src/components/modals/StewardPinModal.tsx src/App.tsx
git commit -m "feat: implement mobile app shell, header with language switcher, and 4-tab navigation"
```

---

### Task 6: Tab 1 — Sanctuary Home & Modular Cause Fund Cards

**Files:**
- Create: `src/components/tabs/SanctuaryHome.tsx`, `src/components/sanctuary/CauseFundCard.tsx`
- Test: `src/components/sanctuary/SanctuaryHome.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `useTranslation()`.
- Produces:
  - `SanctuaryHome`: Daily quote reflection banner + mapped `CauseFundCard` list.
  - `CauseFundCard`: Header, verified badge (`Verified by Abbot ✓`), dedicated fulfillment progress bar, deadline tracker (`⏳ 5 days remaining`), and dedicated `Offer to this Cause` button.

- [ ] **Step 1: Write failing tests for CauseFundCard**

Write `src/components/sanctuary/SanctuaryHome.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CauseFundCard } from './CauseFundCard';
import { LanguageProvider } from '../../context/LanguageContext';

describe('CauseFundCard', () => {
  it('renders progress bar, verified badge, deadline, and dedicated offering button', () => {
    const onOfferMock = vi.fn();
    const mockFund = {
      id: 'alms',
      name: 'Daily Alms & Nutritious Food',
      description: 'Supporting daily meal offerings for monks',
      category: 'necessities' as const,
      targetAmount: 1500,
      currentBalance: 1240,
      deadline: '2026-09-22',
      daysRemaining: 5,
      verifiedStatus: { isVerified: true, attestedBy: 'Abbot', badgeLabel: 'Verified by Abbot ✓' },
      supportersCount: 38,
      icon: 'bowl',
      color: '#D97706'
    };

    render(
      <LanguageProvider>
        <CauseFundCard fund={mockFund} onOffer={onOfferMock} />
      </LanguageProvider>
    );

    expect(screen.getByText('Daily Alms & Nutritious Food')).toBeInTheDocument();
    expect(screen.getByText(/Verified by Abbot/i)).toBeInTheDocument();
    expect(screen.getByText(/82%/)).toBeInTheDocument();
    expect(screen.getByText(/5 days remaining/i)).toBeInTheDocument();

    const offerBtn = screen.getByRole('button', { name: /Offer to this Cause/i });
    expect(offerBtn).toBeInTheDocument();
    fireEvent.click(offerBtn);
    expect(onOfferMock).toHaveBeenCalledWith('alms');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/sanctuary/SanctuaryHome.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement CauseFundCard and SanctuaryHome**

Write `CauseFundCard.tsx`:
- Render rounded card with warm border.
- Verified badge with jade green styling (`bg-emerald-50 text-emerald-700 border-emerald-200`).
- Visual progress bar: `<div className="h-2.5 rounded-full bg-parchment-300">...</div>`.
- Deadline pill: `<span className="bg-amber-50 text-amber-900">...</span>`.
- Prominent amber button: `<button onClick={() => onOffer(fund.id)} className="w-full py-3 bg-saffron-600 text-white rounded-xl font-medium">Offer to this Cause</button>`.

Write `SanctuaryHome.tsx`:
- Render teaching quote.
- Map over `funds` from store and render `CauseFundCard`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/sanctuary/SanctuaryHome.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/SanctuaryHome.tsx src/components/sanctuary/ src/components/sanctuary/SanctuaryHome.test.tsx
git commit -m "feat: implement Tab 1 Sanctuary Home with modular CauseFundCard groups and dedicated offering buttons"
```

---

### Task 7: Contextual Offering & Prayer Dedication Modal (`OfferingModal`)

**Files:**
- Create: `src/components/modals/OfferingModal.tsx`, `src/components/modals/BlessingCertificate.tsx`
- Test: `src/components/modals/OfferingModal.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `useTranslation()`.
- Props: `selectedFundId: string | null`, `onClose: () => void`, `onNavigateToLedger: (txHash: string) => void`, `onNavigateToPrayerWall: () => void`.

- [ ] **Step 1: Write failing tests for 3-step OfferingModal flow**

Write `src/components/modals/OfferingModal.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OfferingModal } from './OfferingModal';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('OfferingModal', () => {
  it('allows completing offering flow and displays digital certificate with txHash', () => {
    const onClose = vi.fn();
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <OfferingModal selectedFundId="alms" onClose={onClose} onNavigateToLedger={vi.fn()} onNavigateToPrayerWall={vi.fn()} />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Step 1: Select preset $35
    fireEvent.click(screen.getByText('$35'));
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2: Fill prayer intention
    fireEvent.change(screen.getByPlaceholderText(/prayer intention/i), {
      target: { value: 'Peace and health for family' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Offering/i }));

    // Step 3: Certificate generated with txHash
    expect(screen.getByText(/Digital Blessing Certificate/i)).toBeInTheDocument();
    expect(screen.getByText(/0x/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/modals/OfferingModal.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement OfferingModal and BlessingCertificate**

Write `OfferingModal.tsx`:
- Step 1: Preset amount chips ($15, $35, $70, $150) or custom input.
- Step 2: Donor name (or toggle anonymous), intention category (Healing, Memorial, Peace, Gratitude), personal prayer message.
- Step 3: Calls `store.addDonation(...)`, generates unique `txHash: '0x' + crypto.randomUUID().slice(0, 8)`, and renders `BlessingCertificate`.
- Buttons on certificate: *"Trace on UTXO Ledger"* and *"View on Prayer Wall"*.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/modals/OfferingModal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/modals/OfferingModal.tsx src/components/modals/BlessingCertificate.tsx src/components/modals/OfferingModal.test.tsx
git commit -m "feat: implement contextual 3-step OfferingModal with prayer dedication and digital certificate"
```

---

### Task 8: Tab 2 — Unified UTXO Transparency Ledger & Receipt Inspection Drawer

**Files:**
- Create: `src/components/tabs/UTXOLedger.tsx`, `src/components/transparency/UTXOFlowCard.tsx`, `src/components/transparency/ReceiptInspectionDrawer.tsx`, `src/components/transparency/ProvenanceSearch.tsx`
- Test: `src/components/transparency/UTXOLedger.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `useTranslation()`, `calculateProvenance()`.
- Produces:
  - `UTXOLedger`: Fund category filter pills + visual UTXO flow.
  - `UTXOFlowCard`: Visual diagram showing Inputs $\rightarrow$ Pool Batch $\rightarrow$ Outputs (Spent + Change).
  - Tapping any spent output triggers `ReceiptInspectionDrawer` sliding up with itemized bill, purpose note, and stamped paper receipt photo.
  - `ProvenanceSearch`: Enter `txHash` to view personalized spent % vs. unspent reserves.

- [ ] **Step 1: Write failing tests for UTXO ledger and tap-to-inspect receipt**

Write `src/components/transparency/UTXOLedger.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UTXOLedger } from './UTXOLedger';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('UTXOLedger', () => {
  it('opens receipt inspection bottom sheet when spent output is tapped', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <UTXOLedger />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    const spentOutputCard = screen.getByText(/Green Valley/i);
    expect(spentOutputCard).toBeInTheDocument();
    fireEvent.click(spentOutputCard);

    expect(screen.getByText(/Bill & Receipt Inspection/i)).toBeInTheDocument();
    expect(screen.getByText(/Organic Tofu/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified by Monastery/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/transparency/UTXOLedger.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement UTXOFlowCard, ReceiptInspectionDrawer, ProvenanceSearch, and UTXOLedger**

Write:
- `UTXOFlowCard.tsx`: Recreates the clean visual UTXO layout from mockup Screen 2/5 (Inputs $\rightarrow$ Pool Node $\rightarrow$ Spent & Unspent outputs).
- `ReceiptInspectionDrawer.tsx`: Bottom sheet modal with smooth animation, itemized breakdown, purpose note, verified steward stamp, and zoomable receipt photo.
- `ProvenanceSearch.tsx`: Search input with instant breakdown calculation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/transparency/UTXOLedger.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/UTXOLedger.tsx src/components/transparency/
git commit -m "feat: implement Tab 2 Unified UTXO Transparency Ledger with tap-to-inspect receipt drawer and provenance search"
```

---

### Task 9: Tab 3 — Book of Intentions & Sangha Community Dialogue

**Files:**
- Create: `src/components/tabs/PrayerWall.tsx`, `src/components/prayer/PrayerCard.tsx`, `src/components/prayer/PrayerDialogueDrawer.tsx`
- Test: `src/components/prayer/PrayerWall.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `useTranslation()`.
- Produces:
  - `PrayerWall`: Filter pills (`All`, `Healing`, `Memorial`, `Peace`, `My Prayers`).
  - `PrayerCard`: Displays intention, lotus blessing seal (`Blessed in Morning Chanting 🪷`), and *"Rejoice in Merit"* counter.
  - `PrayerDialogueDrawer`: Expandable threaded conversation between monks (verified saffron badge) and devotees, with comment submission form.

- [ ] **Step 1: Write failing tests for Prayer Wall and monk-devotee dialogue**

Write `src/components/prayer/PrayerWall.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrayerWall } from './PrayerWall';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('PrayerWall & Sangha Dialogue', () => {
  it('displays prayer dedications, rejoices in merit, and opens community dialogue', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <PrayerWall />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/The Nguyen Family/i)).toBeInTheDocument();
    expect(screen.getByText(/Blessed in Morning Chanting/i)).toBeInTheDocument();

    // Click conversation
    const talkBtn = screen.getByText(/conversation/i);
    fireEvent.click(talkBtn);

    expect(screen.getByText(/Venerable Abbot/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write a compassionate message/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/prayer/PrayerWall.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement PrayerCard, PrayerDialogueDrawer, and PrayerWall**

Implement:
- Golden lotus badge for blessed status.
- Rejoice in Merit counter increment.
- Threaded conversation list showing monk messages with saffron badges and devotee replies.
- Message input box to submit new compassionate replies.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/prayer/PrayerWall.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/PrayerWall.tsx src/components/prayer/
git commit -m "feat: implement Tab 3 Prayer Wall with monk and devotee community dialogue threads"
```

---

### Task 10: Tab 4 — Monk Steward Portal & Dynamic Fund Drive Launcher

**Files:**
- Create: `src/components/tabs/StewardPortal.tsx`, `src/components/steward/ExpenseEntryModal.tsx`, `src/components/steward/NewFundModal.tsx`, `src/components/steward/ChantingQueue.tsx`
- Test: `src/components/steward/StewardPortal.test.tsx`

**Interfaces:**
- Consumes: `useMonasteryStore()`, `useTranslation()`.
- Produces:
  - Treasury overview cards with low-fund warnings.
  - `+ Log Expense` modal with camera/receipt photo upload.
  - `+ Launch New Cause Fund` modal with instant spin-off to Tab 1.
  - Morning Chanting Queue: One-tap *"Recite & Bless 🪷"*.

- [ ] **Step 1: Write failing tests for Steward Portal actions**

Write `src/components/steward/StewardPortal.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StewardPortal } from './StewardPortal';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('StewardPortal', () => {
  it('opens Launch New Cause Fund modal and submits a new campaign', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <StewardPortal />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Launch New Cause Fund/i }));
    expect(screen.getByText(/Launch New Cause Fund/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Cause Name/i), { target: { value: 'Solar Roof Expansion' } });
    fireEvent.change(screen.getByLabelText(/Target Goal/i), { target: { value: '3000' } });
    fireEvent.click(screen.getByRole('button', { name: /Launch Fund/i }));

    expect(screen.getByText(/Solar Roof Expansion/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/steward/StewardPortal.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement ExpenseEntryModal, NewFundModal, ChantingQueue, and StewardPortal**

Write:
- `ExpenseEntryModal.tsx`: Amount, vendor, category pills, purpose, and receipt file upload (converts to base64 preview).
- `NewFundModal.tsx`: Cause name, spiritual purpose, target goal, deadline date, category pills, and Abbot verification toggle.
- `ChantingQueue.tsx`: List of pending intentions with *"Recite & Bless 🪷"*.
- `StewardPortal.tsx`: Connects all modules into the admin dashboard.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/steward/StewardPortal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs/StewardPortal.tsx src/components/steward/
git commit -m "feat: implement Tab 4 Monk Steward Portal with expense logging, chanting queue, and new fund launcher"
```

---

### Task 11: End-to-End Integration, Mobile Viewport Polishing & Verification

**Files:**
- Modify: `src/App.tsx`, `index.html`
- Test: `src/App.integration.test.tsx`

**Interfaces:**
- Produces: Complete, polished mobile web application running in development mode, passing all tests and production build.

- [ ] **Step 1: Write integration test covering end-to-end flows**

Write `src/App.integration.test.tsx`:
- Test Tab 1: Devotee clicks `Offer to this Cause` $\rightarrow$ completes modal $\rightarrow$ donation appears on Tab 2 UTXO ledger and Tab 3 Prayer Wall.
- Test Tab 4: Monk launches new fund $\rightarrow$ appears immediately on Tab 1 with its dedicated offering button.
- Test Header: Language switch to `vi` updates texts to Vietnamese.

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: ALL test suites pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Build succeeds without type errors or lint warnings.

- [ ] **Step 4: Commit**

```bash
git add src/ index.html
git commit -m "chore: complete end-to-end integration and verified production build"
```
