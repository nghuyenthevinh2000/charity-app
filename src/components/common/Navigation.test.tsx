import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../../App';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('App Navigation & Role Switcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders exactly 4 navigation tabs', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );
    expect(screen.getByRole('button', { name: /Sanctuary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transparency/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prayer Wall/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Steward/i })).toBeInTheDocument();
    // Confirms NO separate donate tab
    expect(screen.queryByRole('button', { name: /^Donate$/i })).not.toBeInTheDocument();
  });

  it('switches between tabs when bottom navigation buttons are clicked', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Initial tab is Sanctuary
    expect(screen.getByRole('heading', { level: 1, name: /Lotus Grove Sanctuary/i })).toBeInTheDocument();

    // Click Transparency tab
    fireEvent.click(screen.getByRole('button', { name: /Transparency/i }));
    expect(screen.getByRole('heading', { name: /UTXO Transparency Ledger/i })).toBeInTheDocument();

    // Click Prayer Wall tab
    fireEvent.click(screen.getByRole('button', { name: /Prayer Wall/i }));
    expect(screen.getByRole('heading', { name: /Book of Intentions/i })).toBeInTheDocument();

    // Click Sanctuary tab
    fireEvent.click(screen.getByRole('button', { name: /Sanctuary/i }));
    expect(screen.getByText(/In giving, we find boundless peace/i)).toBeInTheDocument();
  });

  it('toggles language between English and Vietnamese', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Initial English tab names
    expect(screen.getByRole('button', { name: /Sanctuary/i })).toBeInTheDocument();

    // Switch to Vietnamese
    const viBtn = screen.getByRole('button', { name: /🇻🇳 VI|Tiếng Việt/i });
    fireEvent.click(viBtn);

    // Vietnamese tab names should appear
    expect(screen.getByRole('button', { name: /Tịnh Xá/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Minh Bạch/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sổ Cầu Nguyện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quản Sự/i })).toBeInTheDocument();

    // Switch back to English
    const enBtn = screen.getByRole('button', { name: /🇬🇧 EN|English/i });
    fireEvent.click(enBtn);

    expect(screen.getByRole('button', { name: /Sanctuary/i })).toBeInTheDocument();
  });

  it('prompts StewardPinModal when selecting Steward tab while locked', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Click Steward tab when locked
    fireEvent.click(screen.getByRole('button', { name: /Steward/i }));

    // PIN modal should appear
    expect(screen.getByRole('heading', { name: /Steward Authentication/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/PIN/i)).toBeInTheDocument();

    // Wrong PIN
    const pinInput = screen.getByPlaceholderText(/PIN/i);
    fireEvent.change(pinInput, { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));

    expect(screen.getByText(/Incorrect PIN/i)).toBeInTheDocument();

    // Correct PIN 1080
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));

    // Modal closed, steward portal displayed
    expect(screen.queryByPlaceholderText(/PIN/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Steward Portal/i })).toBeInTheDocument();
  });

  it('prompts PIN modal when tapping Steward View from role switcher dropdown', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Click role pill
    const rolePill = screen.getByRole('button', { name: /Devotee View/i });
    fireEvent.click(rolePill);

    // In role dropdown, click Steward View
    const stewardOption = screen.getByText(/Steward View|Steward \/ Monk View/i);
    fireEvent.click(stewardOption);

    // PIN modal appears
    expect(screen.getByPlaceholderText(/PIN/i)).toBeInTheDocument();

    // Close/Cancel PIN modal
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(screen.queryByPlaceholderText(/PIN/i)).not.toBeInTheDocument();
  });
});
