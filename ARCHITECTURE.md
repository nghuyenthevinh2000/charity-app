# Solution Architecture: Zen Monastery Transparency & Charity Mobile Web App

## 1. System Overview & Dual-Persona Architecture

```mermaid
flowchart TB
    subgraph Users ["User Personas"]
        Devotee["🙏 Devotee / Donor\n(Mobile Public User)"]
        Monk["🧘 Monk / Steward\n(Monastery Administrator)"]
    end

    subgraph Security ["Access & Mode Control"]
        ModeSwitch["Role Switcher / Mode Context"]
        PINCheck{"Steward Access\n(PIN: 1080)"}
    end

    subgraph Frontend ["Mobile Web Application (React + Vite + Tailwind)"]
        subgraph DevoteeViews ["Devotee / Public Portal"]
            HomeTab["Sanctuary Home\n• Daily Blessing\n• Transparency Metrics\n• Quick Donate"]
            TransTab["Transparency Ledger\n• Filter by Fund/Category\n• Itemized Cost Breakdown\n• Receipt Viewer / Zoom"]
            DonateTab["Donate & Dedicate Flow\n• 3-Step Guided Giving\n• Cause Selection\n• Prayer Dedication Note"]
            PrayerTab["Prayer Intention Wall\n• Devotee Intentions\n• 'Blessed by Monks' Status"]
        end

        subgraph StewardViews ["Monk / Steward Portal"]
            StewardDash["Steward Dashboard\n• Treasury Health & Balances\n• Low-Fund Alerts\n• Expense Statistics"]
            ExpenseLog["+ Log Expense Action\n• Amount, Category, Vendor\n• Purpose Description\n• Camera / Receipt Upload"]
            ChantQueue["Chanting & Intentions Log\n• View Dedication Notes\n• 'Mark as Blessed' Action"]
            LedgerMgmt["Expense Ledger Management\n• Edit / Remove / Verify Items"]
        end

        subgraph CoreState ["Local & Reactive State Engine"]
            Store["Central State Store (Reactive Hook & Storage)"]
            Seed["Sample Monastery Seed Data\n(Preloaded Verified Expenses & Receipts)"]
            LocalCache[("Browser LocalStorage & Offline Sync")]
        end
    end

    %% Connections
    Devotee -->|Public Access| ModeSwitch
    ModeSwitch -->|Devotee Mode| DevoteeViews

    Monk -->|Elevate Role| PINCheck
    PINCheck -->|Authorized| StewardViews

    %% Data interactions
    DonateTab -->|1. Submit Donation + Prayer Note| Store
    ExpenseLog -->|2. Record Expense + Receipt Image| Store
    ChantQueue -->|3. Bless Prayer Intention| Store

    Store <--> LocalCache
    Seed -.->|Initialize if empty| Store
    Store -->|Real-time Reactive Updates| TransTab
    Store -->|Updated Balances| HomeTab
    Store -->|Updated Intentions & Blessings| PrayerTab
    Store -->|Treasury Aggregation| StewardDash
```

---

## 2. End-to-End Data Flow Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Devotee as 🙏 Devotee / Donor
    participant App as 📱 Mobile Web App
    participant State as 📦 App State Store
    actor Monk as 🧘 Monk / Steward

    rect rgb(240, 248, 255)
        note over Devotee, State: Flow 1: Donation & Prayer Dedication
        Devotee->>App: Selects Cause (e.g. Alms Food) & Amount ($50)
        Devotee->>App: Writes Prayer Intention ("For family health & peace")
        Devotee->>App: Submits offering
        App->>State: Creates Donation record & queues Prayer Intention
        State-->>App: Generates Digital Blessing Receipt with Dedication ID
        App-->>Devotee: Shows Zen Confirmation Certificate
    end

    rect rgb(255, 250, 240)
        note over Monk, State: Flow 2: Monks Recite & Bless Intentions
        Monk->>App: Opens Morning Chanting list
        App->>State: Fetches pending prayer intentions
        State-->>App: Returns unchanted dedications
        Monk->>App: Taps "Recite & Bless" during morning chanting
        App->>State: Updates status to "Blessed" with timestamp & lotus seal
        State-->>App: Updates Prayer Wall for public & donor verification
    end

    rect rgb(245, 255, 245)
        note over Monk, Devotee: Flow 3: Transparent Expense Logging & Public Verification
        Monk->>App: Spends $84.50 on fresh market groceries for monastery alms
        Monk->>App: Snaps photo of paper receipt & tags category "Alms & Food"
        Monk->>App: Submits expense entry
        App->>State: Appends expense to ledger & deducts from "Alms Food" fund balance
        State-->>App: Recalculates treasury balance & updates public timeline
        Devotee->>App: Opens Transparency Ledger
        App-->>Devotee: Shows $84.50 grocery entry with verified receipt & monk note
    end
```

---

## 2.1. UTXO Blockchain Ledger & Provenance Engine

```mermaid
flowchart LR
    subgraph Inputs ["UTXO Inputs (Donation Off-Chain/On-Chain Txs)"]
        D1["Donation #TX-0x8e2\nDevotee Ananda: $50\n(Alms Food Fund)"]
        D2["Donation #TX-0x3c1\nDevotee Linh: $40\n(Alms Food Fund)"]
    end

    subgraph BatchTX ["Monastery Spending Transaction #TX-0xa49f"]
        Pool["Fund Pool Input: $90.00\nCategory: Alms & Groceries\nDate: Sep 16, 2026"]
    end

    subgraph Outputs ["UTXO Outputs (Expense & Unspent Change)"]
        Out1["SPENT OUTPUT ($72.50)\nPayee: Green Valley Market\nItems: Fresh Tofu & Rice\nReceipt Hash: sha256:e3b0...\nPhoto: verified_receipt.jpg"]
        Out2["UNSPENT CHANGE ($17.50)\nStatus: Retained in Treasury\nReady for next batch spending"]
    end

    D1 --> Pool
    D2 --> Pool
    Pool --> Out1
    Pool --> Out2

    subgraph Provenance ["Devotee Provenance Tracker"]
        Tracker["Devotee inputs TX Hash (e.g. 0x8e2...)\nCalculates proportional allocation:\n• $40.28 (80.5%) spent on Groceries\n• $9.72 (19.5%) unspent in Treasury"]
    end

    D1 -.-> Tracker
    Out1 -.-> Tracker
    Out2 -.-> Tracker
```

## 3. Component Hierarchy & Mobile Navigation

```mermaid
graph TD
    AppRoot["App.tsx (Root Layout & Mobile Container)"]

    %% Shell
    AppRoot --> Header["Zen Header\n• Monastery Seal\n• Mode Switcher (Devotee / Monk)"]
    AppRoot --> Viewport["Main Viewport (Route / Active Tab Screen)"]
    AppRoot --> BottomNav["Bottom Navigation Bar (5 Icons)"]

    %% Views
    Viewport --> TabHome["Tab 1: Sanctuary (Home)\n• Quote of the Day\n• Live Fund Cards\n• Quick Stat Pill\n• CTA: Make Offering"]
    Viewport --> TabTrans["Tab 2: Transparency\n• Fund Filter Pills\n• Search Bar\n• Expense Feed Card List\n• Receipt Viewer Drawer"]
    Viewport --> TabDonate["Tab 3: Donate & Dedicate\n• Step 1: Fund Selection\n• Step 2: Amount & Frequency\n• Step 3: Prayer Intention\n• Step 4: Digital Blessing Card"]
    Viewport --> TabPrayer["Tab 4: Prayer Wall\n• Intention Feed\n• Blessing Status Badges\n• Filter by Intention Type"]
    Viewport --> TabSteward["Tab 5: Steward Portal\n(Monk Only)\n• Treasury Balance Overview\n• Quick Action: + Log Expense\n• Chanting Queue Manager\n• Audit History"]

    %% Sub-components
    TabTrans --> ReceiptModal["ReceiptInspectionModal\n• Full Image with Zoom\n• Vendor & Itemized Items\n• Monk Attestation Note"]
    TabSteward --> ExpenseFormModal["ExpenseEntryModal\n• Amount Input\n• Category Selector\n• Camera / File Upload\n• Purpose Notes"]
```

---

## 4. Key Entities & Domain Model

```mermaid
classDiagram
    class Fund {
        +string id
        +string name
        +string description
        +string icon
        +number currentBalance
        +number monthlyTarget
        +string colorToken
    }

    class Expense {
        +string id
        +string fundId
        +number amount
        +string date
        +string vendor
        +string category
        +string description
        +string receiptImageUrl
        +string loggedByMonk
        +boolean verified
    }

    class Donation {
        +string id
        +string fundId
        +number amount
        +string date
        +string donorName
        +boolean isAnonymous
        +string prayerIntention
        +string intentionType
        +string blessingStatus
        +string blessedAt
    }

    Fund "1" <-- "*" Expense : deducted from
    Fund "1" <-- "*" Donation : allocated to
    Donation "1" --> "0..1" Expense : funding chain
```
