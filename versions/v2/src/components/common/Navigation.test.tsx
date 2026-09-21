import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../../App';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('App Navigation & Role Switcher (V2 3-Tab Shell)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders exactly 3 navigation tabs', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );
    expect(screen.getByRole('button', { name: /charity packages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proof explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /monk steward/i })).toBeInTheDocument();
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
    expect(screen.getByText(/Winter Warmth & Rice Kit/i)).toBeInTheDocument();

    // Click Proof Explorer tab
    fireEvent.click(screen.getByRole('button', { name: /proof explorer/i }));
    expect(screen.getByRole('tabpanel', { name: /Public Field Proofs/i })).toBeInTheDocument();

    // Click Monk Steward tab (prompts PIN if locked)
    fireEvent.click(screen.getByRole('button', { name: /monk steward/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Steward Authentication/i)).toBeInTheDocument();
  });

  it('toggles language between English and Vietnamese', () => {
    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <App />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /charity packages/i })).toBeInTheDocument();

    // Switch to Vietnamese
    const viBtn = screen.getByRole('button', { name: /🇻🇳 VI|Tiếng Việt/i });
    fireEvent.click(viBtn);

    expect(screen.getByRole('button', { name: /Gói Thiện Nguyện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Khám Phá Minh Chứng/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quản Sự/i })).toBeInTheDocument();

    // Switch back to English
    const enBtn = screen.getByRole('button', { name: /🇬🇧 EN|English/i });
    fireEvent.click(enBtn);

    expect(screen.getByRole('button', { name: /charity packages/i })).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: /monk steward/i }));

    // PIN modal should appear
    expect(screen.getByRole('heading', { name: /Steward Authentication/i })).toBeInTheDocument();

    // Quick fill 1080 and unlock
    fireEvent.click(screen.getByRole('button', { name: /1080/i }));
    fireEvent.click(screen.getByRole('button', { name: /Unlock/i }));

    // Modal closed, steward workspace displayed
    expect(screen.queryByText(/Steward Authentication/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Monastery Steward Workspace/i })).toBeInTheDocument();
  });
});
