import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App smoke test', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders app title', () => {
    render(<App />);
    expect(screen.getByText(/Lotus Grove/i)).toBeInTheDocument();
  });

  it('renders sanctuary home tab with cause funds on default load', () => {
    render(<App />);
    expect(screen.getByText(/Active Cause Funds/i)).toBeInTheDocument();
    expect(screen.getByText('Daily Alms & Nutritious Food')).toBeInTheDocument();
    const offerButtons = screen.getAllByRole('button', { name: /Offer to this Cause/i });
    expect(offerButtons.length).toBeGreaterThan(0);
  });

  it('opens OfferingModal when clicking Offer to this Cause and navigates to Prayer Wall upon certificate action', () => {
    render(<App />);

    const offerButtons = screen.getAllByRole('button', { name: /Offer to this Cause/i });
    fireEvent.click(offerButtons[0]);

    // Modal opens with selected fund
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Make an Offering & Dedication/i)).toBeInTheDocument();

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('$35'));
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2 -> Submit
    fireEvent.change(screen.getByPlaceholderText(/prayer intention/i), {
      target: { value: 'Peace for all beings' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Offering/i }));

    // Step 3 -> Certificate rendered
    expect(screen.getByText(/Digital Blessing Certificate/i)).toBeInTheDocument();

    // Click "View on Prayer Wall"
    const prayerWallBtn = screen.getByRole('button', { name: /View on Prayer Wall/i });
    fireEvent.click(prayerWallBtn);

    // Modal should close and active tab should be Prayer Wall
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Prayer Wall/i })).toBeInTheDocument();
  });

  it('navigates to UTXO Transparency Ledger when clicking Trace on UTXO Ledger from certificate', () => {
    render(<App />);

    const offerButtons = screen.getAllByRole('button', { name: /Offer to this Cause/i });
    fireEvent.click(offerButtons[0]);

    fireEvent.click(screen.getByText(/Next/i));
    fireEvent.click(screen.getByRole('button', { name: /Submit Offering/i }));

    const traceBtn = screen.getByRole('button', { name: /Trace on UTXO Ledger/i });
    fireEvent.click(traceBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /UTXO Transparency Ledger/i })).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search by your donation TX Hash/i) as HTMLInputElement;
    expect(searchInput.value).toMatch(/^0x/);
  });

  it('authenticates steward with PIN, launches new fund, and displays it on Sanctuary tab', () => {
    render(<App />);

    // Click Steward tab in bottom nav
    const stewardTabBtn = screen.getByRole('button', { name: /Steward/i });
    fireEvent.click(stewardTabBtn);

    // PIN modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Steward Authentication/i)).toBeInTheDocument();

    // Quick fill 1080 or type PIN
    fireEvent.click(screen.getByRole('button', { name: '1080' }));
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));

    // PIN modal closes and Steward Portal renders
    expect(screen.queryByText(/Steward Authentication/i)).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Steward Portal/i })).toBeInTheDocument();

    // Launch a new fund
    fireEvent.click(screen.getByRole('button', { name: /Launch New Cause Fund/i }));
    fireEvent.change(screen.getByLabelText(/Cause Name/i), { target: { value: 'Zen Solar Library' } });
    fireEvent.change(screen.getByLabelText(/Target Goal/i), { target: { value: '4500' } });
    fireEvent.click(screen.getByRole('button', { name: /Launch Fund/i }));

    // Verify fund exists in Steward portal
    expect(screen.getByText('Zen Solar Library')).toBeInTheDocument();

    // Switch back to Sanctuary tab
    const sanctuaryTabBtn = screen.getByRole('button', { name: /Sanctuary/i });
    fireEvent.click(sanctuaryTabBtn);

    // Fund must be live on Sanctuary tab!
    expect(screen.getByText('Zen Solar Library')).toBeInTheDocument();
  });
});

