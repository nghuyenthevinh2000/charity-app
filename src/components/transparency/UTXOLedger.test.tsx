import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { UTXOLedger } from './UTXOLedger';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('UTXOLedger', () => {
  beforeEach(() => {
    localStorage.clear();
  });

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

  it('closes receipt drawer when close button is clicked', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <UTXOLedger />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    const spentOutputCard = screen.getByText(/Green Valley/i);
    fireEvent.click(spentOutputCard);

    expect(screen.getByText(/Bill & Receipt Inspection/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close Receipt/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Bill & Receipt Inspection/i)).not.toBeInTheDocument();
  });

  it('filters transactions when fund category filter pills are clicked', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <UTXOLedger />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Green Valley is in 'alms' fund, Dharma Herbals is in 'healthcare', Pure Mountain is in 'utilities'
    expect(screen.getByText(/Green Valley/i)).toBeInTheDocument();
    expect(screen.getByText(/Dharma Herbals/i)).toBeInTheDocument();

    // Click healthcare filter pill
    const healthcarePill = screen.getByRole('button', { name: /Healthcare/i });
    fireEvent.click(healthcarePill);

    // Should show Dharma Herbals and hide Green Valley
    expect(screen.getByText(/Dharma Herbals/i)).toBeInTheDocument();
    expect(screen.queryByText(/Green Valley/i)).not.toBeInTheDocument();

    // Click All Funds pill
    const allPill = screen.getByRole('button', { name: /All Funds/i });
    fireEvent.click(allPill);

    expect(screen.getByText(/Green Valley/i)).toBeInTheDocument();
  });

  it('performs provenance search by donation TX hash and displays breakdown', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <UTXOLedger />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Initial seed donation d1 has txHash 0x8e2a149f ($50)
    const searchInput = screen.getByPlaceholderText(/Search by your donation TX Hash/i);
    fireEvent.change(searchInput, { target: { value: '0x8e2a149f' } });

    const traceBtn = screen.getByRole('button', { name: /Trace My Offering/i });
    fireEvent.click(traceBtn);

    // Should display Devotee Ananda and breakdown info
    expect(screen.getAllByText(/Devotee Ananda/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Verified Spent/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Treasury Reserve/i).length).toBeGreaterThanOrEqual(1);
  });

  it('pre-populates and calculates provenance when initialTxHash is provided', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <UTXOLedger initialTxHash="0x8e2a149f" />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getAllByText(/Devotee Ananda/i).length).toBeGreaterThanOrEqual(1);
    const searchInput = screen.getByPlaceholderText(/Search by your donation TX Hash/i) as HTMLInputElement;
    expect(searchInput.value).toBe('0x8e2a149f');
  });
});
