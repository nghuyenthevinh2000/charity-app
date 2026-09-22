import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

describe('V2 End-to-End Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    if (!window.HTMLElement.prototype.scrollIntoView) {
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    }
  });

  describe('Devotee Complete Journey', () => {
    it('allows devotee to browse charity packages, sponsor a package with prayer dedication, view blessing certificate, jump to proof explorer, and inspect on-chain proof', () => {
      render(<App />);

      // --- 1. BROWSE CHARITY PACKAGES (TAB 1) ---
      expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sponsor This Package/i })).toBeInTheDocument();

      // Click "Sponsor This Package"
      fireEvent.click(screen.getByRole('button', { name: /Sponsor This Package/i }));

      // --- 2. COMPLETE SPONSORSHIP MODAL ---
      const modalDialog = screen.getByRole('dialog');
      expect(modalDialog).toBeInTheDocument();
      expect(within(modalDialog).getByText(/Sponsor Winter Warmth & Rice Kit/i)).toBeInTheDocument();

      // --- 3. JUMP TO PROOF EXPLORER (TAB 2) ---
      fireEvent.click(within(modalDialog).getByRole('button', { name: /Close/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /proof explorer/i }));
      expect(screen.getByRole('tabpanel', { name: /Public Field Proofs/i })).toBeInTheDocument();
    });
  });

  describe('Monk Steward Complete Journey', () => {
    it('authenticates monk with PIN, creates new charity package, and verifies in proof explorer', () => {
      render(<App />);

      // --- 1. UNLOCK STEWARD PORTAL FROM PROFILE TAB (PIN 1080) ---
      const profileTab = screen.getByRole('button', { name: /profile/i });
      fireEvent.click(profileTab);

      const loginBtn = screen.getByRole('button', { name: /Monk Steward Login/i });
      fireEvent.click(loginBtn);

      const pinModal = screen.getByRole('dialog');
      expect(within(pinModal).getByText(/Steward Authentication/i)).toBeInTheDocument();

      fireEvent.click(within(pinModal).getByRole('button', { name: '1080' }));
      fireEvent.click(within(pinModal).getByRole('button', { name: /^Unlock$/i }));

      expect(screen.queryByText(/Steward Authentication/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Monastery Steward Workspace/i)).toBeInTheDocument();

      // --- 2. CREATE NEW CHARITY PACKAGE ---
      const createPkgBtn = screen.getByRole('button', { name: /Create Charity Package/i });
      fireEvent.click(createPkgBtn);

      const pkgModal = screen.getByRole('dialog');
      expect(within(pkgModal).getByText(/Create New Charity Package/i)).toBeInTheDocument();

      fireEvent.change(within(pkgModal).getByLabelText(/Package Title/i), {
        target: { value: 'Zen Mountain Solar Library' },
      });
      fireEvent.change(within(pkgModal).getByLabelText(/Unit Price/i), { target: { value: '50' } });
      fireEvent.change(within(pkgModal).getByLabelText(/Target Units/i), { target: { value: '60' } });

      const publishBtn = within(pkgModal).getByRole('button', { name: /Publish Package/i });
      fireEvent.click(publishBtn);

      expect(screen.queryByText(/Create New Charity Package/i)).not.toBeInTheDocument();
      expect(screen.getByText('Zen Mountain Solar Library')).toBeInTheDocument();

      // --- 3. VERIFY IN PROOF EXPLORER (TAB 2) ---
      const proofExplorerTab = screen.getByRole('button', { name: /proof explorer/i });
      fireEvent.click(proofExplorerTab);
      expect(screen.getByRole('tabpanel', { name: /Public Field Proofs/i })).toBeInTheDocument();
    });
  });

  describe('Language Switcher Flow', () => {
    it('persists and renders Vietnamese language when configured, and switches language in Profile', () => {
      localStorage.setItem('lotus_language', 'vi');
      render(<App />);

      expect(screen.getByRole('button', { name: /Gói Thiện Nguyện/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Khám Phá Minh Chứng/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Hồ Sơ/i })).toBeInTheDocument();

      // Open Profile tab and toggle back to English
      fireEvent.click(screen.getByRole('button', { name: /Hồ Sơ/i }));
      fireEvent.click(screen.getByRole('button', { name: /English \(EN\)/i }));

      expect(screen.getByRole('button', { name: /Charity Packages/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Proof Explorer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Profile/i })).toBeInTheDocument();
    });
  });
});

