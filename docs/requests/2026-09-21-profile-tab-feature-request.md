# Feature Request & RFC: Dedicated "Profile" Tab

**Date:** September 21, 2026  
**Status:** PROPOSED  
**Target Version:** V2.1  
**Related Components:** `Header.tsx`, `BottomNav.tsx`, `PersonalPurchases.tsx`, `App.tsx`

---

## 1. Background & Motivation

In Version 2 of the Lotus Grove Sanctuary application, the top `<header>` banner was removed from the active screen viewport to achieve a full-bleed, edge-to-edge experience for:
- **Tab 1 (Charity Packages Marketplace):** Uninterrupted single-card viewport for high-impact photography, package details, and direct sponsorship actions.
- **Tab 2 (On-Chain Proof Explorer):** Screen-filling proof cards with seamless vertical scrolling/swiping without partial cutoffs or header obstruction.

With the header removed, the following controls need a dedicated, permanent home:
1. **Language Translation Switcher:** Quick toggle between English (`🇬🇧 EN`) and Vietnamese (`🇻🇳 VI`).
2. **Role & Workspace Switcher:** Switching between Devotee View and Monk Steward View (guarded by PIN `1080`).
3. **Personal Donation & Impact Tracking (`PersonalPurchases`):** Devotee's private history of sponsored packages, prayer dedications, instant cryptographic TX hashes, and delivery fulfillment status.

Rather than cluttering the public feed or package cards, these user-centric controls and private records should be unified into a dedicated **"Profile"** (or **"Account"**) tab.

---

## 2. Proposed Scope & Functional Requirements

### Tab Navigation Update
- Add a 4th tab to the bottom navigation bar (`BottomNav.tsx`):
  - **Tab 1: Charity Packages** (`'market'`, icon: `Gift`)
  - **Tab 2: Proof Explorer** (`'proof'`, icon: `Camera`)
  - **Tab 3: Monk Steward Portal** (`'steward'`, icon: `Shield`)
  - **Tab 4: Devotee Profile** (`'profile'`, icon: `User` or `UserCircle`)

---

### Key Sections in the Profile Tab (`ProfileView.tsx`)

#### A. Devotee Identity & Role Switcher
- Devotee avatar / lotus emblem with active mode badge (`Devotee` vs `Monk Steward`).
- **Role Switcher Dropdown / Segmented Button:**
  - If selecting *Devotee View*: Active tab stays or switches to public view.
  - If selecting *Monk Steward*: Prompts `StewardPinModal` (PIN `1080`). Once unlocked, grants access to the Steward Workspace.
  - Quick button to **Lock Steward Workspace** if unlocked.

#### B. Language & Localization Preferences
- Interactive toggle between:
  - 🇻🇳 **Tiếng Việt (VI)**
  - 🇬🇧 **English (EN)**
- Uses `LanguageContext` (`setLanguage`), persisting selection in `localStorage` under `lotus_language`.
- Instant reactive text updates across the entire app.

#### C. Personal Donation & Package Tracker (`PersonalPurchases`)
- Integrates the existing `PersonalPurchases.tsx` component into the Profile tab.
- Features:
  - **Private Devotee Ledger:** Strictly displays packages sponsored on this device (`userPurchases` in `MonasteryStore`).
  - **Package Offering Cards:**
    - Package title and items breakdown.
    - Quantity sponsored & total USD offering.
    - Devotee dedication / prayer blessing note.
    - Cryptographic Transaction Hash (`0x...`) with one-click copy button.
    - Fulfillment badge:
      - ⏳ *Queued for Field Distribution*
      - ✅ *Fulfilled with On-Chain Proof*
    - Direct link action: **"View Distribution Proof"**, which switches the active tab to Tab 2 (`proof`) and activates the specific campaign card.

#### D. Sanctuary Information & App Info
- Version tag (`v2.0 Packaged Giving`).
- Smart contract address and Merkle proof verification ledger info.
- Monastery contact and relief mission dispatch information.

---

## 3. Technical Architecture & File Plan

```
versions/v2/src/
├── components/
│   ├── common/
│   │   ├── BottomNav.tsx       <-- Add 'profile' to TabId ('market' | 'proof' | 'steward' | 'profile')
│   │   ├── Header.tsx          <-- Modularize internal language & role controls for reuse
│   │   └── ProfileView.tsx     <-- NEW: Unified Profile screen container
│   ├── proof/
│   │   └── PersonalPurchases.tsx <-- Rendered directly inside ProfileView
├── App.tsx                     <-- Render <ProfileView /> when activeTab === 'profile'
└── context/
    ├── LanguageContext.tsx     <-- Consumed by ProfileView
    └── MonasteryStore.tsx      <-- userPurchases & isStewardUnlocked consumed by ProfileView
```

---

## 4. Acceptance Criteria

1. **Navigation:** Bottom navigation bar features 4 distinct tabs with appropriate localized labels and active highlights.
2. **Language Selection:** Devotees can change language in the Profile tab; language changes apply instantly and persist across reloads.
3. **Role Switcher:** Devotees can initiate monk authentication from the Profile tab via PIN modal; authenticated stewards can lock from the Profile tab.
4. **Personal Tracking:** Devotees can view all their past package purchases, view TX receipts, and click through to field distribution proofs.
5. **Clean Shell:** Header remains omitted from market and proof feeds, ensuring a completely uninhibited, screen-filling UI.
