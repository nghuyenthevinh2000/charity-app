import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { PrayerWall } from './PrayerWall';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('PrayerWall & Sangha Dialogue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('displays prayer dedications, rejoices in merit, and opens community dialogue', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <PrayerWall />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/The Nguyen Family/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Blessed in Morning Chanting/i).length).toBeGreaterThan(0);

    // Click conversation
    const talkBtn = screen.getByText(/conversation/i);
    fireEvent.click(talkBtn);

    expect(screen.getByText(/Venerable Abbot/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write a compassionate message/i)).toBeInTheDocument();
  });

  it('increments rejoice in merit counter when clicking Anumodana button', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <PrayerWall />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Initial rejoice count for Devotee Ananda (d1) is 12
    const anandaCard = screen.getByText(/Devotee Ananda/i).closest('article');
    expect(anandaCard).toBeInTheDocument();

    const rejoiceBtn = anandaCard!.querySelector('button[aria-label*="Rejoice"], button[data-testid="rejoice-btn"]');
    expect(rejoiceBtn).toBeInTheDocument();
    expect(rejoiceBtn).toHaveTextContent(/12/);

    fireEvent.click(rejoiceBtn!);
    expect(rejoiceBtn).toHaveTextContent(/13/);
  });

  it('filters prayer intentions by category chips', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <PrayerWall />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Memorial filter chip
    const memorialFilter = screen.getByRole('button', { name: /Memorial|In Loving Memory/i });
    fireEvent.click(memorialFilter);

    // Nguyen Family (memorial) should be present
    expect(screen.getByText(/The Nguyen Family/i)).toBeInTheDocument();
    // Devotee Ananda (healing) should not be visible
    expect(screen.queryByText(/Devotee Ananda/i)).not.toBeInTheDocument();

    // Healing filter chip
    const healingFilter = screen.getByRole('button', { name: /Healing/i });
    fireEvent.click(healingFilter);

    expect(screen.getByText(/Devotee Ananda/i)).toBeInTheDocument();
    expect(screen.queryByText(/The Nguyen Family/i)).not.toBeInTheDocument();

    // All filter chip
    const allFilter = screen.getByRole('button', { name: /^All$/i });
    fireEvent.click(allFilter);
    expect(screen.getByText(/The Nguyen Family/i)).toBeInTheDocument();
    expect(screen.getByText(/Devotee Ananda/i)).toBeInTheDocument();
  });

  it('allows submitting a new compassionate message in the Sangha dialogue drawer', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <PrayerWall />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Open dialogue on Nguyen Family card
    const nguyenCard = screen.getByText(/The Nguyen Family/i).closest('article');
    const talkBtn = nguyenCard!.querySelector('button[data-testid="dialogue-trigger-btn"]') || screen.getAllByText(/conversation/i)[0];
    fireEvent.click(talkBtn);

    const input = screen.getByPlaceholderText(/Write a compassionate message/i);
    fireEvent.change(input, { target: { value: 'Deeply touched by your devotion. Namo Amitabha Buddha!' } });

    const submitBtn = screen.getByRole('button', { name: /Send Message|Send/i });
    fireEvent.click(submitBtn);

    // New message should be displayed in dialogue
    expect(screen.getByText(/Deeply touched by your devotion/i)).toBeInTheDocument();
  });

  it('closes dialogue drawer when close button is clicked', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <PrayerWall />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    const talkBtn = screen.getByText(/conversation/i);
    fireEvent.click(talkBtn);

    expect(screen.getByPlaceholderText(/Write a compassionate message/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close dialogue|close/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByPlaceholderText(/Write a compassionate message/i)).not.toBeInTheDocument();
  });
});
