import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../../App';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('App Navigation & Role Switcher (V2 3-Tab Shell)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders exactly 3 navigation tabs with Profile as third tab for devotees', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );
    expect(screen.getByRole('button', { name: /charity packages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proof explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
    // Old tabs removed
    expect(screen.queryByRole('button', { name: /sanctuary/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /prayer wall/i })).not.toBeInTheDocument();
  });

  it('switches between tabs when bottom navigation buttons are clicked', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Initial tab is Charity Packages
    expect(screen.getByText(/Compassionate Canine Rescue & Care/i)).toBeInTheDocument();

    // Click Proof Explorer tab
    fireEvent.click(screen.getByRole('button', { name: /proof explorer/i }));
    expect(screen.getByRole('tabpanel', { name: /Public Field Proofs/i })).toBeInTheDocument();

    // Click Profile tab
    fireEvent.click(screen.getByRole('button', { name: /profile/i }));
    expect(screen.getByText(/Devotee Practitioner/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Personal Giving Tracker/i)).toBeInTheDocument();
  });

  it('displays navigation tabs in Vietnamese when language is set to vi', () => {
    localStorage.setItem('lotus_language', 'vi');
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /Gói Thiện Nguyện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Khám Phá Minh Chứng/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hồ Sơ/i })).toBeInTheDocument();
  });

  it('prompts StewardPinModal from Profile tab, unlocks steward, transforms Tab 3, and can lock back', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Click Profile tab
    fireEvent.click(screen.getByRole('button', { name: /profile/i }));

    // Click Monk Steward Login button
    fireEvent.click(screen.getByRole('button', { name: /Monk Steward Login/i }));

    // PIN modal should appear
    expect(screen.getByRole('heading', { name: /Steward Authentication/i })).toBeInTheDocument();

    // Quick fill 1080 and unlock
    fireEvent.click(screen.getByRole('button', { name: /^1080$/ }));
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));

    // Modal closed, steward workspace displayed
    expect(screen.queryByText(/Steward Authentication/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Monastery Steward Workspace/i })).toBeInTheDocument();

    // Tab 3 now displays Monk Steward
    expect(screen.getByRole('button', { name: /monk steward/i })).toBeInTheDocument();

    // Lock portal returns to profile tab
    fireEvent.click(screen.getByRole('button', { name: /Lock Portal/i }));
    expect(screen.getByText(/Devotee Practitioner/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
  });
});
