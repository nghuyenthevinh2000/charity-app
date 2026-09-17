# Zen Monastery Charity & UTXO Transparency Mobile Web App — Design Specification

- **Date:** 2026-09-17
- **Target Platform:** Mobile-First Web Application (PWA-ready, responsive smartphone viewport)
- **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, LocalStorage persistence
- **Repository Path:** `/Users/thevinhnguyen/Documents/computer-science/projects/app-factory/projects/charity-app`

---

## 1. Executive Summary & Vision

The **Zen Monastery Charity & UTXO Transparency App** is a mobile web application designed to connect Buddhist monks/stewards with devotees and donors. It bridges spiritual practice and financial honesty by providing **radical, cryptographic-style transparency** into how every donation is spent on basic necessities (food/alms, healthcare, electricity/utilities, repairs). 

By implementing a **UTXO (Unspent Transaction Output) inspired model**, donations serve as *Inputs* to dedicated cause funds, which monks spend as *Outputs* (direct vendor expenses with verified receipt photos + unspent change retained in treasury reserves). Donors can track the exact lifecycle of their offerings and attach prayer intentions for family health, peace, or ancestors, which monks recite and bless during morning chanting services.

---

## 2. User Roles & Security Model

1. **Devotee / Donor (Public Role):**
   - Browse temple sanctuary, teachings, and active funds.
   - Explore the **Unified UTXO Transparency Ledger**: visual fund flow showing donation inputs, spent outputs, unspent change, and tap-to-inspect receipts.
   - Make offerings to designated cause funds with custom/preset amounts and prayer dedication notes.
   - Access the **Book of Intentions (Prayer Wall)**, view monks' blessing status, and rejoice in others' merits (`🙏 Anumodana`).
   - Track personal offering provenance by pasting or clicking their donation transaction hash (`txHash`).

2. **Monk / Steward (Monastery Administrator Role):**
   - Access the **Steward Portal** via a gentle role switch in the header (protected with a default steward PIN `1080`).
   - Log daily monastery expenses with mobile camera receipt photo upload, vendor name, category tag, and purpose note.
   - Review devotees' incoming prayer dedications in the **Morning Chanting Queue** and mark them as *"Recited & Blessed 🪷"*.
   - Monitor treasury health, fund balances, and low-reserve alerts.

---

## 3. Information Architecture & Mobile Navigation

The app is framed in a mobile layout (`max-w-md mx-auto` on desktop, full native screen on mobile) with 5 bottom navigation tabs:

```
┌───────────────────────────────────────────────────────────┐
│  🪷 Lotus Grove Sanctuary               [ Devotee ▾ ]     │  <-- Header & Role Switcher
├───────────────────────────────────────────────────────────┤
│                                                           │
│                                                           │
│                    Active Screen View                     │
│               (Scrollable Mobile Viewport)                │
│                                                           │
│                                                           │
├───────────────────────────────────────────────────────────┤
│  [🏠 Sanctuary]    [👁️ Transparency]    [📖 Prayer Wall]    [👘 Steward]  │  <-- 4 Focused Bottom Tabs
└───────────────────────────────────────────────────────────┘
```

### Tab 1: Sanctuary (Home) — Modular Cause Fund Campaign Groups
- **Monastery Greeting & Seal:** Lotus Grove Vihara.
- **Daily Reflection / Teaching Card:** e.g., *"In giving, we find boundless peace"*.
- **Modular Cause Fund Groups (`CauseFundCard`):**
  Each cause fund is encapsulated in its own self-contained, reusable component group so new donation funds can spin off dynamically at any time without UI restructuring:
  1. **Header & Verified Status:**
     - Cause title, serene category icon, and official verified status badge (e.g., `Verified by Abbot ✓` in jade green).
  2. **Dedicated Fulfillment Bar:**
     - Visual progress bar showing real-time fulfillment percentage.
     - Live metrics: e.g., `$1,240 raised of $1,500 target (82% fulfilled)` and `38 devotees offered`.
  3. **Time Deadline / Cycle Indicator:**
     - Clear deadline or renewal badge: e.g., `⏳ 5 days remaining (Ends Sep 22)` or `🔄 Monthly Recurring: 8 days left`.
  4. **Dedicated Offering Button (Right below each fund group):**
     - Prominent warm amber button: `Offer to this Cause` directly embedded below the fulfillment bar.
     - Tapping this button immediately launches the contextual **Offering Modal** with this fund pre-selected.
  5. **Dynamic Spin-Off Architecture:**
     - Supported by the extensible `Fund` data model. New emergency drives or seasonal projects (e.g., *Winter Warmth Robes*, *Monastery Solar Roof*, *Dharma Book Printing*) can be added dynamically and render with identical fidelity and functionality.

---

### Contextual Flow: Offering & Prayer Dedication Modal
Triggered directly when a devotee taps `Offer to this Cause` on any fund card:
- **Step 1: Cause & Amount:**
  - Selected fund header and purpose reminder.
  - Quick amount pills ($15, $35, $70, $150) or custom dollar input.
  - One-time vs Monthly recurring switch.
- **Step 2: Prayer Intention & Dedication:**
  - Donor identification: Full name, Family name, or *Anonymous Devotee*.
  - Intention category: *Healing & Longevity (Cầu An)*, *In Loving Memory (Cầu Siêu)*, *Peace & Gratitude*.
  - Intention message: Multiline text area for personal prayers.
  - Wall visibility: *Public on Prayer Wall* vs *Private to Monks Only*.
- **Step 3: Confirmation & Digital Blessing Certificate:**
  - Generates unique donation transaction hash (`0x...`).
  - Displays a shareable Zen digital certificate with gold lotus seal and prayer dedication.
  - Direct links to **"Trace on UTXO Ledger"** and **"View on Prayer Wall"**.

---

### Tab 2: Unified UTXO Transparency Ledger (Fund Flow + Receipt Drill-Down)
This tab unifies the UTXO fund flow with itemized receipt inspection:
1. **Fund Selector Chips:** Toggle between `All Funds`, `Alms & Food`, `Healthcare`, `Utilities`, `Maintenance`.
2. **UTXO Visual Flow Card:**
   - **Inputs (Left):** Recent donation inputs with donor names, amounts, and shortened transaction hashes (e.g. `Devotee Ananda $50 tx:0x8e2...`).
   - **Batch Transaction Node (Center):** Shows total pool allocated for the expense event (e.g., `TX #0xa49f — $90.00`).
   - **Outputs (Right):**
     - **Spent Output:** e.g., `SPENT $72.50 → Green Valley Market` with receipt thumbnail icon. **Clicking this triggers the Receipt Inspection Drawer.**
     - **Unspent Change Output:** e.g., `UNSPENT CHANGE $17.50 → Retained in Treasury`.
3. **Receipt Inspection Drawer (Bottom Sheet / Modal):**
   - Triggers when any spent output is clicked.
   - Displays:
     - Formatted amount: `$72.50`.
     - Merchant/Vendor name & date: `Green Valley Farmers Market — Sep 16, 2026`.
     - Itemized list: Fresh tofu, organic greens, brown rice, sesame oil.
     - Monk purpose note: *"Nutritious breakfast and lunch for 35 resident monks and visiting pilgrims."*
     - Full high-resolution receipt image (with tap-to-zoom).
     - Official verification seal: `Verified by Monastery Kitchen Steward`.
     - Cryptographic proof: `Receipt Hash: sha256:e3b0c442...`
4. **Devotee Provenance Search:**
   - Input field: *"Enter your Donation TX Hash to trace your offering"*.
   - Displays personalized breakdown: e.g. *"Your $50 donation: 72.5% spent on verified groceries, 27.5% currently in temple reserve."*

---

### Tab 3: Book of Intentions (Prayer Wall)
- Community feed of devotee prayers with filter pills (*All*, *Healing*, *In Loving Memory*, *Peace*, *My Prayers*).
- Status indicator:
  - `Queued for Morning Chanting` (pending)
  - `Blessed in Morning Chanting • 6:00 AM 🪷` (blessed)
- Community interaction: **"Rejoice in Merit" (`🙏 Anumodana`)** button with count increment.

---

### Tab 4: Monk Steward Portal (Admin)
- Authenticated view (PIN: `1080`).
- **Treasury Overview:** Total balance per fund, monthly expenditure totals, and low-fund alerts.
- **Quick Action `+ Log New Expense` Modal:**
  - Amount, fund category, merchant/payee, date.
  - Purpose description.
  - Receipt photo: Mobile camera capture or file upload (stored in base64 / object URL).
- **Morning Chanting Queue:**
  - List of pending prayer dedications.
  - One-tap button: *"Recite & Bless 🪷"* (attaches blessing timestamp to the devotee's prayer).

---

## 4. Data Models & TypeScript Interfaces

```typescript
export type FundCategory = 'necessities' | 'healthcare' | 'operations' | 'infrastructure' | 'special-drive';

export interface Fund {
  id: string;
  name: string;
  description: string;
  category: FundCategory;
  targetAmount: number;
  currentBalance: number;
  deadline: string; // ISO date string or cycle description
  daysRemaining?: number;
  verifiedStatus: {
    isVerified: boolean;
    attestedBy: string; // e.g. "Abbot Thich Tam Duc"
    badgeLabel: string; // e.g. "Verified by Abbot ✓"
  };
  supportersCount: number;
  icon: string;
  color: string;
}

export interface DonationInput {
  id: string;
  txHash: string;
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  fundId: FundId;
  date: string;
  prayerIntention?: {
    category: 'healing' | 'memorial' | 'peace' | 'gratitude';
    dedicationText: string;
    isPublic: boolean;
    blessingStatus: 'queued' | 'blessed';
    blessedAt?: string;
    rejoiceCount: number;
  };
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

export interface MonasteryTransaction {
  id: string;
  txHash: string;
  date: string;
  fundId: FundId;
  inputs: {
    donationId: string;
    txHash: string;
    donorName: string;
    amountContributed: number;
  }[];
  spentOutput: SpentOutput;
  changeOutput: {
    amount: number;
    destinationFundId: FundId;
  };
}
```

---

## 5. UI/UX & Visual Design Tokens

- **Background:** Soft warm parchment / cream (`#FAF7F2`).
- **Card Surfaces:** Pure white (`#FFFFFF`) with subtle warm borders (`#EFEAE1`).
- **Primary Sacred Accent:** Warm saffron / amber (`#D97706`, `#B45309`).
- **Gold Accent:** Sacred lotus gold (`#F59E0B`).
- **Trust & Verification Badges:** Jade / sage green (`#059669`, `#D1FAE5`).
- **Typography:**
  - Headings: Serif (`font-serif`, Georgia / Merriweather).
  - Body: Geometric Sans (`font-sans`, Inter / system-ui).
- **Tactile Details:**
  - Subtle ripple effect on *"Rejoice in Merit"* and *"Bless"* buttons.
  - Modal bottom sheets with smooth drag/slide animations.
  - Pinch/tap-to-zoom on receipt photos.

---

## 6. Testing & Verification Strategy

1. **Unit & Logic Tests:**
   - UTXO math invariant test: Ensure `Sum(Inputs) == SpentOutput + ChangeOutput`.
   - Fund balance recalculation test upon logging an expense and making a donation.
   - Provenance calculation test: Correctly compute percentage spent vs. unspent for any given donation `txHash`.
2. **Component & Flow Tests:**
   - Donation flow completion creates a valid `txHash` and updates the Prayer Wall.
   - Monk expense logging updates the UTXO ledger and reflects in the transparency view.
   - Clicking a spent output in the UTXO flow opens the receipt inspection drawer with correct details.
   - Role switching and PIN verification for Steward mode.
3. **Responsive Mobile Testing:**
   - Pixel-perfect layout check across standard mobile viewport widths (`375px`, `390px`, `414px`, `480px`).
