import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileView } from './ProfileView';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider, useMonasteryStore } from '../../context/MonasteryStore';
import React from 'react';

function ProfileTestWrapper({
  children,
  defaultUnlocked = false,
}: {
  children: React.ReactNode;
  defaultUnlocked?: boolean;
}) {
  return (
    <LanguageProvider>
      <MonasteryStoreProvider>
        <StoreInitializer defaultUnlocked={defaultUnlocked}>
          {children}
        </StoreInitializer>
      </MonasteryStoreProvider>
    </LanguageProvider>
  );
}

function StoreInitializer({
  children,
  defaultUnlocked,
}: {
  children: React.ReactNode;
  defaultUnlocked: boolean;
}) {
  const { unlockSteward, lockSteward } = useMonasteryStore();
  React.useEffect(() => {
    if (defaultUnlocked) {
      unlockSteward('1080');
    } else {
      lockSteward();
    }
  }, [defaultUnlocked, unlockSteward, lockSteward]);

  return <>{children}</>;
}

describe('ProfileView Component', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders devotee identity and login CTA in locked mode without devotee mode badge', () => {
    const handleUnlock = vi.fn();
    render(
      <ProfileTestWrapper defaultUnlocked={false}>
        <ProfileView onRequestStewardUnlock={handleUnlock} />
      </ProfileTestWrapper>
    );

    expect(screen.getByText('Devotee Practitioner')).toBeInTheDocument();
    expect(screen.queryByText('Devotee Mode')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Monk Steward Login/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Monk Steward Login/i }));
    expect(handleUnlock).toHaveBeenCalledTimes(1);
  });

  it('toggles language between English and Vietnamese reactively', () => {
    render(
      <ProfileTestWrapper>
        <ProfileView />
      </ProfileTestWrapper>
    );

    // Initial language is English
    expect(screen.getByText('Devotee Practitioner')).toBeInTheDocument();

    // Click Tiếng Việt button
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Việt/i }));
    expect(screen.getByText('Phật Tử Phát Tâm')).toBeInTheDocument();
    expect(localStorage.getItem('lotus_language')).toBe('vi');

    // Click English button
    fireEvent.click(screen.getByRole('button', { name: /English/i }));
    expect(screen.getByText('Devotee Practitioner')).toBeInTheDocument();
    expect(localStorage.getItem('lotus_language')).toBe('en');
  });

  it('copies smart contract address to clipboard with feedback', async () => {
    render(
      <ProfileTestWrapper>
        <ProfileView />
      </ProfileTestWrapper>
    );

    expect(screen.getByText('0x7a250d5630b4cf539739df2c5dacb4c659f2488d')).toBeInTheDocument();
    const copyBtn = screen.getByRole('button', { name: /^Copy$/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0x7a250d5630b4cf539739df2c5dacb4c659f2488d');
    await waitFor(() => {
      expect(screen.getByText(/Copied/i)).toBeInTheDocument();
    });
  });

  it('renders PersonalPurchases tracker within ProfileView', () => {
    render(
      <ProfileTestWrapper>
        <ProfileView />
      </ProfileTestWrapper>
    );

    expect(screen.getByText('Your Personal Giving Tracker')).toBeInTheDocument();
  });

  it('shows steward management actions and unlocked badge when authenticated', () => {
    const handleNavigate = vi.fn();
    render(
      <ProfileTestWrapper defaultUnlocked={true}>
        <ProfileView onNavigateToSteward={handleNavigate} />
      </ProfileTestWrapper>
    );

    expect(screen.getByText(/Monk Steward Mode \(Unlocked\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Steward Portal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lock Steward Workspace/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Open Steward Portal/i }));
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });
});
