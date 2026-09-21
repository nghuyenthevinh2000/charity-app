import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from './Header';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';

describe('Header Component (Isolated Unit Tests)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderHeader = (props = {}) => {
    return render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <Header {...props} />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );
  };

  it('renders sanctuary branding and counts', () => {
    renderHeader();
    expect(screen.getByText('Lotus Grove Sanctuary')).toBeInTheDocument();
    expect(screen.getByText(/v2.0 Packaged Giving/i)).toBeInTheDocument();
    expect(screen.getByText(/Packages/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Proofs/i)).toBeInTheDocument();
  });

  it('switches languages between English and Vietnamese', () => {
    renderHeader();

    const viBtn = screen.getByRole('button', { name: /🇻🇳 VI|Tiếng Việt/i });
    fireEvent.click(viBtn);
    expect(screen.getByText('Tịnh Xá Sen Vàng')).toBeInTheDocument();

    const enBtn = screen.getByRole('button', { name: /🇬🇧 EN|English/i });
    fireEvent.click(enBtn);
    expect(screen.getByText('Lotus Grove Sanctuary')).toBeInTheDocument();
  });

  it('toggles role selection dropdown', () => {
    const onSelectRole = vi.fn();
    const onRequestStewardUnlock = vi.fn();

    renderHeader({
      currentRole: 'devotee',
      onSelectRole,
      onRequestStewardUnlock,
    });

    const roleDropdownBtn = screen.getByRole('button', { name: /Devotee View/i });
    fireEvent.click(roleDropdownBtn);

    // Menu options
    expect(screen.getByText(/Steward \/ Monk View/i)).toBeInTheDocument();

    // Clicking Steward option triggers onRequestStewardUnlock when locked
    fireEvent.click(screen.getByText(/Steward \/ Monk View/i));
    expect(onRequestStewardUnlock).toHaveBeenCalled();
  });
});
