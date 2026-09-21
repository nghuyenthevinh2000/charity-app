import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfferingModal } from './OfferingModal';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('OfferingModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows completing offering flow and displays digital certificate with txHash', () => {
    const onClose = vi.fn();
    const onNavigateToLedger = vi.fn();
    const onNavigateToPrayerWall = vi.fn();

    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <OfferingModal
            selectedFundId="alms"
            onClose={onClose}
            onNavigateToLedger={onNavigateToLedger}
            onNavigateToPrayerWall={onNavigateToPrayerWall}
          />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Step 1: Select preset $35
    fireEvent.click(screen.getByText('$35'));
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2: Fill prayer intention
    fireEvent.change(screen.getByPlaceholderText(/prayer intention/i), {
      target: { value: 'Peace and health for family' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Offering/i }));

    // Step 3: Certificate generated with txHash
    expect(screen.getByText(/Digital Blessing Certificate/i)).toBeInTheDocument();
    expect(screen.getByText(/0x/)).toBeInTheDocument();
  });

  it('supports custom amount input and anonymous toggle', () => {
    const onClose = vi.fn();
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <OfferingModal
            selectedFundId="alms"
            onClose={onClose}
            onNavigateToLedger={vi.fn()}
            onNavigateToPrayerWall={vi.fn()}
          />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Enter custom amount
    const customInput = screen.getByPlaceholderText(/108/i) || screen.getByLabelText(/Custom Amount/i);
    fireEvent.change(customInput, { target: { value: '108' } });

    fireEvent.click(screen.getByText(/Next/i));

    // Check anonymous toggle
    const anonCheckbox = screen.getByLabelText(/anonymous/i);
    fireEvent.click(anonCheckbox);

    // Fill prayer intention
    fireEvent.change(screen.getByPlaceholderText(/prayer intention/i), {
      target: { value: 'For all sentient beings' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Offering/i }));

    // Certificate should show $108 and Anonymous Devotee
    expect(screen.getByText(/Digital Blessing Certificate/i)).toBeInTheDocument();
    expect(screen.getByText(/\$108/)).toBeInTheDocument();
    expect(screen.getByText(/Anonymous Devotee/i)).toBeInTheDocument();
  });

  it('triggers onNavigateToLedger and onNavigateToPrayerWall from certificate actions', () => {
    const onClose = vi.fn();
    const onNavigateToLedger = vi.fn();
    const onNavigateToPrayerWall = vi.fn();

    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <OfferingModal
            selectedFundId="alms"
            onClose={onClose}
            onNavigateToLedger={onNavigateToLedger}
            onNavigateToPrayerWall={onNavigateToPrayerWall}
          />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Step 1: $70 preset
    fireEvent.click(screen.getByText('$70'));
    fireEvent.click(screen.getByText(/Next/i));

    // Step 2: Name and dedication
    const nameInput = screen.getByPlaceholderText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Ananda Family' } });

    fireEvent.change(screen.getByPlaceholderText(/prayer intention/i), {
      target: { value: 'Gratitude for the Sangha' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Offering/i }));

    // Step 3: Test actions
    const traceBtn = screen.getByRole('button', { name: /Trace on UTXO Ledger/i });
    expect(traceBtn).toBeInTheDocument();
    fireEvent.click(traceBtn);
    expect(onNavigateToLedger).toHaveBeenCalledWith(expect.stringMatching(/^0x/));

    const prayerWallBtn = screen.getByRole('button', { name: /View on Prayer Wall/i });
    expect(prayerWallBtn).toBeInTheDocument();
    fireEvent.click(prayerWallBtn);
    expect(onNavigateToPrayerWall).toHaveBeenCalled();
  });

  it('allows navigating back from Step 2 to Step 1', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <OfferingModal
            selectedFundId="alms"
            onClose={vi.fn()}
            onNavigateToLedger={vi.fn()}
            onNavigateToPrayerWall={vi.fn()}
          />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText(/Next/i));
    expect(screen.getByPlaceholderText(/prayer intention/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByText('$15')).toBeInTheDocument();
    expect(screen.getByText('$35')).toBeInTheDocument();
  });

  it('renders nothing when selectedFundId is null', () => {
    const { container } = render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <OfferingModal
            selectedFundId={null}
            onClose={vi.fn()}
            onNavigateToLedger={vi.fn()}
            onNavigateToPrayerWall={vi.fn()}
          />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
