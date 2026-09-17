import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Polyfill window.HTMLElement.prototype.scrollIntoView if not defined in jsdom
    if (!window.HTMLElement.prototype.scrollIntoView) {
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    }
  });

  describe('Devotee Complete Journey', () => {
    it('allows devotee to browse sanctuary, offer with prayer intention, trace on UTXO ledger, rejoice on prayer wall, and converse in Sangha dialogue', () => {
      render(<App />);

      // --- 1. BROWSE SANCTUARY (TAB 1) ---
      expect(screen.getByText('Lotus Grove Sanctuary')).toBeInTheDocument();
      expect(screen.getByText('Active Cause Funds')).toBeInTheDocument();
      expect(screen.getByText('Daily Alms & Nutritious Food')).toBeInTheDocument();

      // Find offering buttons
      const offerButtons = screen.getAllByRole('button', { name: /Offer to this Cause/i });
      expect(offerButtons.length).toBeGreaterThan(0);

      // Click "Offer to this Cause" on first fund (Daily Alms)
      fireEvent.click(offerButtons[0]);

      // --- 2. COMPLETE OFFERING MODAL ---
      const modalDialog = screen.getByRole('dialog');
      expect(modalDialog).toBeInTheDocument();
      expect(within(modalDialog).getByText(/Make an Offering & Dedication/i)).toBeInTheDocument();

      // Step 1: Select amount ($35 preset or custom)
      const preset35 = within(modalDialog).getByText('$35');
      fireEvent.click(preset35);
      const nextBtn = within(modalDialog).getByRole('button', { name: /Next/i });
      fireEvent.click(nextBtn);

      // Step 2: Fill dedication details
      const nameInput = within(modalDialog).getByPlaceholderText(/Devotee name/i);
      fireEvent.change(nameInput, { target: { value: 'Nguyen Minh Tri' } });

      const prayerInput = within(modalDialog).getByPlaceholderText(/prayer intention/i);
      fireEvent.change(prayerInput, {
        target: { value: 'Peace, boundless health, and serenity for my elderly parents' },
      });

      const submitBtn = within(modalDialog).getByRole('button', { name: /Submit Offering/i });
      fireEvent.click(submitBtn);

      // Step 3: Verify Digital Blessing Certificate
      expect(within(modalDialog).getByText(/Digital Blessing Certificate/i)).toBeInTheDocument();
      expect(within(modalDialog).getByText('Nguyen Minh Tri')).toBeInTheDocument();
      expect(
        within(modalDialog).getByText(/Peace, boundless health, and serenity for my elderly parents/i)
      ).toBeInTheDocument();

      // Verify cryptographic UTXO TX Hash is generated
      const txProofElement = within(modalDialog).getByText(/^0x[a-f0-9]{8}/i);
      const generatedTxHash = txProofElement.textContent?.trim() || '';
      expect(generatedTxHash).toMatch(/^0x/);

      // --- 3. TRACE ON UTXO LEDGER (TAB 2) ---
      const traceBtn = within(modalDialog).getByRole('button', { name: /Trace on UTXO Ledger/i });
      fireEvent.click(traceBtn);

      // Modal closes and active tab switches to UTXO Ledger
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      const ledgerRegion = screen.getByRole('region', { name: /UTXO Transparency Ledger/i });
      expect(ledgerRegion).toBeInTheDocument();

      // Provenance search automatically ran for generated TX hash
      const searchInput = screen.getByPlaceholderText(/Search by your donation TX Hash/i) as HTMLInputElement;
      expect(searchInput.value).toBe(generatedTxHash);
      expect(screen.getByText('Verified Devotee Offering')).toBeInTheDocument();
      expect(screen.getAllByText('Nguyen Minh Tri').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$35.00').length).toBeGreaterThan(0);
      expect(screen.getByText('Treasury Reserve')).toBeInTheDocument();

      // Devotee inspects a verified merchant receipt on the ledger
      const inspectReceiptButtons = screen.getAllByRole('button', { name: /Inspect receipt for/i });
      expect(inspectReceiptButtons.length).toBeGreaterThan(0);
      fireEvent.click(inspectReceiptButtons[0]);

      // Receipt inspection bottom drawer opens
      const receiptModal = screen.getByRole('dialog');
      expect(receiptModal).toBeInTheDocument();
      expect(within(receiptModal).getByText(/Bill & Receipt Inspection/i)).toBeInTheDocument();

      // Close the receipt inspection drawer
      const closeReceiptBtn = within(receiptModal).getByLabelText('Close');
      fireEvent.click(closeReceiptBtn);
      expect(screen.queryByText(/Bill & Receipt Inspection/i)).not.toBeInTheDocument();

      // --- 4. VIEW ON PRAYER WALL & REJOICE IN MERIT (TAB 3) ---
      const prayerWallTab = screen.getByRole('button', { name: /Prayer Wall/i });
      fireEvent.click(prayerWallTab);

      const prayerWallRegion = screen.getByRole('region', { name: /Prayer Wall/i });
      expect(prayerWallRegion).toBeInTheDocument();

      // Find newly dedicated prayer card
      expect(screen.getByText('Nguyen Minh Tri')).toBeInTheDocument();
      expect(
        screen.getByText(/"Peace, boundless health, and serenity for my elderly parents"/)
      ).toBeInTheDocument();

      // Rejoice in Merit (Anumodana)
      const rejoiceButtons = screen.getAllByTestId('rejoice-btn');
      expect(rejoiceButtons.length).toBeGreaterThan(0);
      // Click rejoice on the card
      fireEvent.click(rejoiceButtons[0]);

      // --- 5. SANGHA COMMUNITY DIALOGUE THREAD ---
      const dialogueButtons = screen.getAllByTestId('dialogue-trigger-btn');
      expect(dialogueButtons.length).toBeGreaterThan(0);
      fireEvent.click(dialogueButtons[0]);

      // Dialogue drawer opens
      const dialogueDrawer = screen.getByRole('dialog');
      expect(dialogueDrawer).toBeInTheDocument();
      expect(within(dialogueDrawer).getByText('Sangha Community Dialogue')).toBeInTheDocument();

      // Devotee enters name and compassionate reflection
      const devoteeNameInput = within(dialogueDrawer).getByLabelText('Devotee name');
      fireEvent.change(devoteeNameInput, { target: { value: 'Sister Dieu An' } });

      const messageInput = within(dialogueDrawer).getByLabelText('Compassionate message');
      fireEvent.change(messageInput, {
        target: { value: 'May your parents be blessed with long life and serenity! Nam Mo A Di Da Phat.' },
      });

      const sendBtn = within(dialogueDrawer).getByRole('button', { name: /Send Message/i });
      fireEvent.click(sendBtn);

      // Verify the new reply appears in the dialogue conversation
      expect(
        within(dialogueDrawer).getByText(
          'May your parents be blessed with long life and serenity! Nam Mo A Di Da Phat.'
        )
      ).toBeInTheDocument();
      expect(within(dialogueDrawer).getByText('Sister Dieu An')).toBeInTheDocument();

      // Close the dialogue drawer
      const closeDialogueBtn = within(dialogueDrawer).getByLabelText(/Close dialogue/i);
      fireEvent.click(closeDialogueBtn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Monk Steward Complete Journey', () => {
    it('authenticates monk with PIN, logs verified expense with receipt, launches new cause fund live on Tab 1, and blesses chanting queue', () => {
      render(<App />);

      // --- 1. UNLOCK STEWARD PORTAL (PIN 1080) ---
      const stewardTab = screen.getByRole('button', { name: /Steward/i });
      fireEvent.click(stewardTab);

      // Steward PIN Modal opens
      const pinModal = screen.getByRole('dialog');
      expect(within(pinModal).getByText(/Steward Authentication/i)).toBeInTheDocument();

      // Click quick PIN preset 1080 and unlock
      fireEvent.click(within(pinModal).getByRole('button', { name: '1080' }));
      fireEvent.click(within(pinModal).getByRole('button', { name: /Unlock/i }));

      // Portal unlocks
      expect(screen.queryByText(/Steward Authentication/i)).not.toBeInTheDocument();
      const stewardRegion = screen.getByRole('region', { name: /Steward Portal/i });
      expect(stewardRegion).toBeInTheDocument();
      expect(within(stewardRegion).getByText(/Authenticated as Abbot \/ Steward/i)).toBeInTheDocument();

      // --- 2. LOG VERIFIED EXPENSE WITH RECEIPT ---
      const logExpenseBtn = screen.getByRole('button', { name: /Log.*Expense/i });
      fireEvent.click(logExpenseBtn);

      const expenseModal = screen.getByRole('dialog');
      expect(within(expenseModal).getByText(/Log New Expense/i)).toBeInTheDocument();

      // Fill expense form
      const amountInput = within(expenseModal).getByLabelText(/Expense Amount/i);
      fireEvent.change(amountInput, { target: { value: '180' } });

      const merchantInput = within(expenseModal).getByLabelText(/Payee \/ Merchant/i);
      fireEvent.change(merchantInput, { target: { value: 'Pure Lotus Tofu Co.' } });

      const purposeInput = within(expenseModal).getByLabelText(/Spiritual Purpose/i);
      fireEvent.change(purposeInput, {
        target: { value: 'Organic handmade tofu and soy milk for monastery breakfast alms' },
      });

      // Attach sample receipt
      const sampleReceiptBtn = within(expenseModal).getByRole('button', { name: /Use Sample Receipt/i });
      fireEvent.click(sampleReceiptBtn);
      expect(within(expenseModal).getByText(/Receipt proof attached/i)).toBeInTheDocument();

      // Submit expense
      const submitExpenseBtn = within(expenseModal).getByRole('button', { name: /Record Expense/i });
      fireEvent.click(submitExpenseBtn);
      expect(screen.queryByText(/Log New Expense/i)).not.toBeInTheDocument();

      // Verify transaction is logged on UTXO Transparency Ledger (Tab 2)
      const ledgerTab = screen.getByRole('button', { name: /Transparency/i });
      fireEvent.click(ledgerTab);

      expect(screen.getByText('Pure Lotus Tofu Co.')).toBeInTheDocument();
      expect(
        screen.getByText(/Organic handmade tofu and soy milk for monastery breakfast alms/i)
      ).toBeInTheDocument();

      // --- 3. LAUNCH NEW CAUSE FUND & VERIFY LIVE ON TAB 1 ---
      // Return to Steward portal
      fireEvent.click(screen.getByRole('button', { name: /Steward/i }));

      const launchFundBtn = screen.getByRole('button', { name: /Launch.*Fund/i });
      fireEvent.click(launchFundBtn);

      const newFundModal = screen.getByRole('dialog');
      expect(within(newFundModal).getByText(/Launch New Cause Fund/i)).toBeInTheDocument();

      const fundNameInput = within(newFundModal).getByLabelText(/Cause Name/i);
      fireEvent.change(fundNameInput, { target: { value: 'Zen Mountain Solar Library' } });

      const targetInput = within(newFundModal).getByLabelText(/Target Goal/i);
      fireEvent.change(targetInput, { target: { value: '7500' } });

      const descInput = within(newFundModal).getByLabelText(/Spiritual Purpose \/ Description/i);
      fireEvent.change(descInput, {
        target: { value: 'Constructing quiet solar-powered Dharma study sanctuary for retreatants' },
      });

      const launchSubmitBtn = within(newFundModal).getByRole('button', { name: /Launch Fund/i });
      fireEvent.click(launchSubmitBtn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Switch to Sanctuary Home (Tab 1)
      const sanctuaryTab = screen.getByRole('button', { name: /Sanctuary/i });
      fireEvent.click(sanctuaryTab);

      // Verify new fund immediately renders on Tab 1
      expect(screen.getByText('Zen Mountain Solar Library')).toBeInTheDocument();
      expect(
        screen.getByText('Constructing quiet solar-powered Dharma study sanctuary for retreatants')
      ).toBeInTheDocument();
      expect(screen.getByText('$0 / $7,500 target (0%)')).toBeInTheDocument();

      // Verify its dedicated offering button works
      const allOfferButtons = screen.getAllByRole('button', { name: /Offer to this Cause/i });
      // The newest fund card has its offer button
      fireEvent.click(allOfferButtons[allOfferButtons.length - 1]);

      // Offering modal opens for this newly created fund
      const openedOfferingModal = screen.getByRole('dialog');
      expect(within(openedOfferingModal).getByText('Zen Mountain Solar Library')).toBeInTheDocument();
      const closeOfferBtn = within(openedOfferingModal).getByLabelText('Close');
      fireEvent.click(closeOfferBtn);

      // --- 4. RECITE & BLESS MORNING CHANTING QUEUE ---
      fireEvent.click(screen.getByRole('button', { name: /Steward/i }));

      // Locate pending queue items in Morning Chanting section
      const blessButtons = screen.queryAllByRole('button', { name: /Recite & Bless 🪷/i });
      if (blessButtons.length > 0) {
        fireEvent.click(blessButtons[0]);
        // Verified status change
        expect(screen.getAllByText(/Blessed • Morning Chanting/i).length).toBeGreaterThan(0);
      }

      // --- 5. LOCK PORTAL VIA LOCK ACTION ---
      const lockButton = screen.getByRole('button', { name: /Lock Steward Portal/i });
      fireEvent.click(lockButton);

      // Re-navigates to Sanctuary Home
      expect(screen.getByLabelText(/Sanctuary Home/i)).toBeInTheDocument();

      // Clicking Steward tab now requires PIN again
      fireEvent.click(screen.getByRole('button', { name: /Steward/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Steward Authentication/i)).toBeInTheDocument();
    });
  });

  describe('Language Switcher Cross-Tab Flow', () => {
    it('seamlessly switches between Vietnamese and English, updating texts dynamically across tabs', () => {
      render(<App />);

      // Verify initial English default
      expect(screen.getByText('Lotus Grove Sanctuary')).toBeInTheDocument();
      expect(screen.getByText('Active Cause Funds')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Offer to this Cause/i }).length).toBeGreaterThan(0);

      // Switch language to Vietnamese [🇻🇳 VI]
      const viBtn = screen.getByRole('button', { name: /Tiếng Việt/i });
      fireEvent.click(viBtn);

      // Verify Header & Tab 1 in Vietnamese
      expect(screen.getByText('Tịnh Xá Sen Vàng')).toBeInTheDocument();
      expect(screen.getByText('Các Quỹ Thiện Nguyện Hiện Tại')).toBeInTheDocument();
      expect(screen.getByText(/"Trong sự sẻ chia, ta tìm thấy an lạc vô biên"/)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Cúng Dường Quỹ Này/i }).length).toBeGreaterThan(0);

      // Verify Bottom Navigation tabs in Vietnamese
      expect(screen.getByRole('button', { name: 'Tịnh Xá' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Minh Bạch' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sổ Cầu Nguyện' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Quản Sự' })).toBeInTheDocument();

      // Switch to Tab 2 (Minh Bạch)
      fireEvent.click(screen.getByRole('button', { name: 'Minh Bạch' }));
      expect(screen.getByText('Sổ Minh Bạch UTXO')).toBeInTheDocument();
      expect(
        screen.getByText('Chạm vào khoản đã chi để kiểm tra hóa đơn chứng từ xác thực')
      ).toBeInTheDocument();

      // Switch to Tab 3 (Sổ Cầu Nguyện)
      fireEvent.click(screen.getByRole('button', { name: 'Sổ Cầu Nguyện' }));
      expect(screen.getByText(/Sổ Tâm Nguyện & Tăng Thân/i)).toBeInTheDocument();

      // Switch back to English [🇬🇧 EN]
      const enBtn = screen.getByRole('button', { name: /English/i });
      fireEvent.click(enBtn);

      // Verify instantaneous English translations
      expect(screen.getByText('Lotus Grove Sanctuary')).toBeInTheDocument();
      expect(screen.getByText(/Book of Intentions & Sangha/i)).toBeInTheDocument();

      // Switch back to Tab 1 (Sanctuary)
      fireEvent.click(screen.getByRole('button', { name: 'Sanctuary' }));
      expect(screen.getByText('Active Cause Funds')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Offer to this Cause/i }).length).toBeGreaterThan(0);
    });
  });
});
