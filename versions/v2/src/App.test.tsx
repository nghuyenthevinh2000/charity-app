import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('Charity App V2 Shell & Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the 3 main tabs: Packages, Proof Explorer, and Monk Steward', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /charity packages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proof explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monk steward/i })).toBeInTheDocument();
    // Old prayer wall is removed
    expect(screen.queryByRole('button', { name: /prayer wall/i })).not.toBeInTheDocument();
  });

  it('switches between tabs cleanly', () => {
    render(<App />);

    // Default tab is packages
    expect(screen.getByText(/Winter Warmth & Rice Kit/i)).toBeInTheDocument();

    // Switch to Proof Explorer
    fireEvent.click(screen.getByRole('button', { name: /proof explorer/i }));
    expect(screen.getByRole('tabpanel', { name: /Public Field Proofs/i })).toBeInTheDocument();

    // Switch to Monk Steward
    fireEvent.click(screen.getByRole('button', { name: /monk steward/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Steward Authentication/i)).toBeInTheDocument();
  });

  it('sponsors a package, completes purchase, and jumps to Proof Explorer', () => {
    render(<App />);

    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
    const sponsorBtn = screen.getByRole('button', { name: /Sponsor This Package/i });
    fireEvent.click(sponsorBtn);

    // Modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Sponsor Winter Warmth & Rice Kit/i)).toBeInTheDocument();

    // Confirm purchase
    fireEvent.click(screen.getByRole('button', { name: /Confirm Sponsorship/i }));

    // Confirmation state
    expect(screen.getByText(/Offering Blessed & Recorded/i)).toBeInTheDocument();

    // Click View in On-Chain Explorer
    fireEvent.click(screen.getByRole('button', { name: /View in On-Chain Explorer/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('tabpanel', { name: /Public Field Proofs/i })).toBeInTheDocument();
  });

  it('authenticates steward with PIN, launches new package, and displays it in steward portal list', () => {
    render(<App />);

    // Click Monk Steward tab
    fireEvent.click(screen.getByRole('button', { name: /monk steward/i }));

    // PIN modal opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '1080' }));
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));

    // Portal unlocks
    expect(screen.queryByText(/Steward Authentication/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Monastery Steward Workspace/i)).toBeInTheDocument();

    // Create a new package
    fireEvent.click(screen.getByRole('button', { name: /Create Charity Package/i }));
    fireEvent.change(screen.getByLabelText(/Package Title/i), { target: { value: 'Zen Meditation Cushion' } });
    fireEvent.change(screen.getByLabelText(/Unit Price/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Target Units/i), { target: { value: '40' } });
    fireEvent.click(screen.getByRole('button', { name: /Publish Package/i }));

    // Verify package exists in Steward portal list
    expect(screen.getByText('Zen Meditation Cushion')).toBeInTheDocument();
  });
});
