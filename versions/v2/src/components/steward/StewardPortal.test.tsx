import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
    expect(screen.getAllByText(/Launch New Cause Fund/i).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText(/Cause Name/i), { target: { value: 'Solar Roof Expansion' } });
    fireEvent.change(screen.getByLabelText(/Target Goal/i), { target: { value: '3000' } });
    fireEvent.click(screen.getByRole('button', { name: /Launch Fund/i }));

    expect(screen.getByText(/Solar Roof Expansion/i)).toBeInTheDocument();
  });

  it('renders treasury summary with total reserves and low-fund alerts', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <StewardPortal />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Total Available Reserves/i)).toBeInTheDocument();
    expect(screen.getByText(/Reserves & Active Funds/i)).toBeInTheDocument();
  });

  it('opens Log Expense modal and logs a verified expenditure', async () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <StewardPortal />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Log Expense|Log New Expense/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Log New Expense/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Expense Amount/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/Payee|Merchant/i), { target: { value: 'Monastery Farm Supply' } });
    fireEvent.change(screen.getByLabelText(/Purchased Items/i), { target: { value: 'Organic Seeds, Soil, Trowels' } });
    fireEvent.change(screen.getByLabelText(/Spiritual Purpose|Purpose/i), { target: { value: 'Community garden revitalization' } });

    // Use sample receipt button
    const sampleBtn = screen.getByRole('button', { name: /Use Sample Receipt/i });
    fireEvent.click(sampleBtn);

    // Submit expense
    fireEvent.click(screen.getByRole('button', { name: /Record Expense|Submit Expense/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('displays morning chanting queue and allows one-tap recite and bless', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <StewardPortal />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Morning Chanting & Prayer Intentions/i)).toBeInTheDocument();
    
    // Find queued intention cards and bless button
    const blessButtons = screen.getAllByRole('button', { name: /Recite & Bless 🪷/i });
    expect(blessButtons.length).toBeGreaterThan(0);

    // Tap first bless button
    fireEvent.click(blessButtons[0]);

    // Should indicate blessed status
    expect(screen.getAllByText(/Blessed/i).length).toBeGreaterThan(0);
  });

  it('validates required fields when attempting to submit incomplete modals', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <StewardPortal />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Test NewFundModal validation
    fireEvent.click(screen.getByRole('button', { name: /Launch New Cause Fund/i }));
    fireEvent.click(screen.getByRole('button', { name: /Launch Fund/i }));
    expect(screen.getByText(/Please enter a cause name/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Test ExpenseEntryModal validation
    fireEvent.click(screen.getByRole('button', { name: /Log Expense|Log New Expense/i }));
    fireEvent.click(screen.getByRole('button', { name: /Record Expense|Submit Expense/i }));
    expect(screen.getByText(/Please enter a valid expense amount/i)).toBeInTheDocument();
  });

  it('allows locking the portal via lock action', () => {
    const onLockMock = vi.fn();
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <StewardPortal onLock={onLockMock} />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    const lockBtn = screen.getByRole('button', { name: /Lock Steward Portal/i });
    fireEvent.click(lockBtn);
    expect(onLockMock).toHaveBeenCalled();
  });
});

