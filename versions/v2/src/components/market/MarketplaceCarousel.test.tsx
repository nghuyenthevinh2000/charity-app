import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { MarketplaceCarousel } from './MarketplaceCarousel';
import { MonasteryProvider } from '../../context/MonasteryStore';
import { LanguageProvider } from '../../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <MonasteryProvider>{ui}</MonasteryProvider>
    </LanguageProvider>
  );
};

describe('MarketplaceCarousel (Tab 1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders exactly one package card at a time on screen', () => {
    renderWithProviders(<MarketplaceCarousel />);

    // Shows package title of first package
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
    // Does not show second package in active view
    expect(screen.queryByText('Highland Student Study Pack')).not.toBeInTheDocument();
    // Indicator shows "Package 1 of 4"
    expect(screen.getByText(/Package 1 of 4/i)).toBeInTheDocument();
  });

  it('navigates to next package when next arrow is clicked', () => {
    renderWithProviders(<MarketplaceCarousel />);

    const nextBtn = screen.getByRole('button', { name: /next package/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Highland Student Study Pack')).toBeInTheDocument();
    expect(screen.getByText(/Package 2 of 4/i)).toBeInTheDocument();
  });

  it('navigates to previous package when prev arrow is clicked', () => {
    renderWithProviders(<MarketplaceCarousel />);

    const prevBtn = screen.getByRole('button', { name: /previous package/i });
    fireEvent.click(prevBtn);

    // Should wrap to last package (Package 4 of 4)
    expect(screen.getByText('Clean Mountain Water Filtration Kit')).toBeInTheDocument();
    expect(screen.getByText(/Package 4 of 4/i)).toBeInTheDocument();
  });

  it('navigates when swipe gesture is simulated', () => {
    const { container } = renderWithProviders(<MarketplaceCarousel />);
    const swipeArea = container.querySelector('.swipe-container');
    expect(swipeArea).not.toBeNull();

    // Simulate swipe left (next)
    fireEvent.touchStart(swipeArea!, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(swipeArea!, { changedTouches: [{ clientX: 100 }] });

    expect(screen.getByText('Highland Student Study Pack')).toBeInTheDocument();

    // Simulate swipe right (prev)
    fireEvent.touchStart(swipeArea!, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(swipeArea!, { changedTouches: [{ clientX: 300 }] });

    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
  });

  it('opens purchase modal when Sponsor button is clicked', () => {
    renderWithProviders(<MarketplaceCarousel />);
    const sponsorBtn = screen.getByRole('button', { name: /sponsor this package/i });
    fireEvent.click(sponsorBtn);

    expect(screen.getByText(/Sponsor Winter Warmth & Rice Kit/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25 per package/i)).toBeInTheDocument();
  });

  it('handles quantity selection, anonymity, and purchasing a package', () => {
    renderWithProviders(<MarketplaceCarousel />);
    const sponsorBtn = screen.getByRole('button', { name: /sponsor this package/i });
    fireEvent.click(sponsorBtn);

    // Check modal opened
    expect(screen.getByText(/Sponsor Winter Warmth & Rice Kit/i)).toBeInTheDocument();

    // Select preset 2 kits
    const preset2 = screen.getByRole('button', { name: /2 kits/i });
    fireEvent.click(preset2);

    // Total should update to $50
    expect(screen.getAllByText(/\$50/)[0]).toBeInTheDocument();

    // Fill donor name
    const nameInput = screen.getByLabelText(/donor name/i);
    fireEvent.change(nameInput, { target: { value: 'Lotus Friend' } });

    // Toggle remain anonymous
    const anonCheckbox = screen.getByRole('checkbox', { name: /remain anonymous/i });
    fireEvent.click(anonCheckbox);

    // Fill dedication note
    const noteInput = screen.getByPlaceholderText(/prayer dedication/i);
    fireEvent.change(noteInput, { target: { value: 'Blessings of peace and good health' } });

    // Click confirm purchase button
    const confirmBtn = screen.getByRole('button', { name: /confirm sponsorship/i });
    fireEvent.click(confirmBtn);

    // Post-purchase confirmation state
    expect(screen.getByText(/Offering Blessed & Recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/Block #/i)).toBeInTheDocument();
    expect(screen.getByText(/0x/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view blessing certificate/i })).toBeInTheDocument();
  });

  it('ignores vertical scrolling so vertical gestures do not trigger carousel navigation', () => {
    const { container } = renderWithProviders(<MarketplaceCarousel />);
    const swipeArea = container.querySelector('.swipe-container');
    expect(swipeArea).not.toBeNull();

    // Simulate vertical scroll: deltaY = 120, deltaX = 20
    fireEvent.touchStart(swipeArea!, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(swipeArea!, { changedTouches: [{ clientX: 220, clientY: 220 }] });

    // Should stay on first package
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
    expect(screen.queryByText('Highland Student Study Pack')).not.toBeInTheDocument();
  });

  it('aborts gesture on touchCancel without navigating', () => {
    const { container } = renderWithProviders(<MarketplaceCarousel />);
    const swipeArea = container.querySelector('.swipe-container');
    expect(swipeArea).not.toBeNull();

    fireEvent.touchStart(swipeArea!, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchCancel(swipeArea!);
    fireEvent.touchEnd(swipeArea!, { changedTouches: [{ clientX: 100, clientY: 100 }] });

    // Should stay on first package because touchStart was cleared
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
  });

  it('navigates to on-chain explorer from receipt action button', () => {
    const mockOpenExplorer = vi.fn();
    renderWithProviders(<MarketplaceCarousel onOpenProofExplorer={mockOpenExplorer} />);

    const sponsorBtn = screen.getByRole('button', { name: /sponsor this package/i });
    fireEvent.click(sponsorBtn);

    const confirmBtn = screen.getByRole('button', { name: /confirm sponsorship/i });
    fireEvent.click(confirmBtn);

    // Click "View in On-Chain Explorer ➔"
    const explorerBtn = screen.getByRole('button', { name: /view in on-chain explorer/i });
    fireEvent.click(explorerBtn);

    expect(mockOpenExplorer).toHaveBeenCalledWith('pkg-winter-warmth');
  });
});

