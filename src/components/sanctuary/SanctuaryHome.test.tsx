import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CauseFundCard } from './CauseFundCard';
import { SanctuaryHome } from '../tabs/SanctuaryHome';
import { LanguageProvider } from '../../context/LanguageContext';
import { MonasteryStoreProvider } from '../../context/MonasteryStore';
import { Fund } from '../../types';

describe('CauseFundCard', () => {
  it('renders progress bar, verified badge, deadline, and dedicated offering button', () => {
    const onOfferMock = vi.fn();
    const mockFund: Fund = {
      id: 'alms',
      name: 'Daily Alms & Nutritious Food',
      description: 'Supporting daily meal offerings for monks',
      category: 'necessities',
      targetAmount: 1500,
      currentBalance: 1240,
      deadline: '2026-09-22',
      daysRemaining: 5,
      verifiedStatus: { isVerified: true, attestedBy: 'Abbot', badgeLabel: 'Verified by Abbot ✓' },
      supportersCount: 38,
      icon: 'bowl',
      color: '#D97706',
    };

    render(
      <LanguageProvider>
        <CauseFundCard fund={mockFund} onOffer={onOfferMock} />
      </LanguageProvider>
    );

    expect(screen.getByText('Daily Alms & Nutritious Food')).toBeInTheDocument();
    expect(screen.getByText(/Verified by Abbot/i)).toBeInTheDocument();
    expect(screen.getByText(/82%/)).toBeInTheDocument();
    expect(screen.getByText(/5 days remaining/i)).toBeInTheDocument();

    const offerBtn = screen.getByRole('button', { name: /Offer to this Cause/i });
    expect(offerBtn).toBeInTheDocument();
    fireEvent.click(offerBtn);
    expect(onOfferMock).toHaveBeenCalledWith('alms');
  });

  it('renders 100% fulfillment and handles zero or missing daysRemaining properly', () => {
    const onOfferMock = vi.fn();
    const fundedFund: Fund = {
      id: 'completed-drive',
      name: 'Roof Repair Project',
      description: 'Completed meditation roof repairs',
      category: 'infrastructure' as any,
      targetAmount: 1000,
      currentBalance: 1200,
      deadline: '2026-12-31',
      verifiedStatus: { isVerified: false, attestedBy: '', badgeLabel: '' },
      supportersCount: 50,
      icon: 'unknown-icon',
      color: '#10B981',
    };

    render(
      <LanguageProvider>
        <CauseFundCard fund={fundedFund} onOffer={onOfferMock} />
      </LanguageProvider>
    );

    expect(screen.getByText('Roof Repair Project')).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.queryByText(/Verified by Abbot/i)).not.toBeInTheDocument();
  });

  it('renders recurring cycle pill for operations funds and avoids double clock icon', () => {
    const recurringFund: Fund = {
      id: 'utilities',
      name: 'Monastery Solar & Clean Water Utilities',
      description: 'Clean energy solar power',
      category: 'operations',
      targetAmount: 2000,
      currentBalance: 1650,
      deadline: '2026-10-05',
      daysRemaining: 18,
      verifiedStatus: { isVerified: true, attestedBy: 'Abbot', badgeLabel: 'Verified by Abbot ✓' },
      supportersCount: 42,
      icon: 'zap',
      color: '#B45309',
    };

    const { container } = render(
      <LanguageProvider>
        <CauseFundCard fund={recurringFund} />
      </LanguageProvider>
    );

    // Verify recurring cycle text is displayed
    expect(screen.getByText(/Monthly Recurring: 18 days left/i)).toBeInTheDocument();

    // Verify no double clock icon rendered inside the deadline pill
    const deadlinePill = container.querySelector('.bg-amber-50');
    expect(deadlinePill).toBeInTheDocument();
    const svgInsidePill = deadlinePill?.querySelector('svg');
    expect(svgInsidePill).toBeNull();
  });

  it('translates verified badge to Vietnamese when language is vi', () => {
    const mockFund: Fund = {
      id: 'alms',
      name: 'Daily Alms',
      description: 'Meal offerings',
      category: 'necessities',
      targetAmount: 1000,
      currentBalance: 500,
      deadline: '2026-09-30',
      daysRemaining: 10,
      verifiedStatus: { isVerified: true, attestedBy: 'Abbot', badgeLabel: 'Verified by Abbot ✓' },
      supportersCount: 15,
      icon: 'bowl',
      color: '#D97706',
    };

    render(
      <LanguageProvider defaultLanguage="vi">
        <CauseFundCard fund={mockFund} />
      </LanguageProvider>
    );

    expect(screen.getByText('Chứng thực bởi Thầy Trụ Trì ✓')).toBeInTheDocument();
  });

  it('renders verified badge with responsive non-overflowing classes on mobile in Vietnamese', () => {
    const mockFund: Fund = {
      id: 'alms',
      name: 'Cúng Dường Trai Tăng & Thực Dưỡng Dài',
      description: 'Meal offerings for sangha',
      category: 'necessities',
      targetAmount: 1000,
      currentBalance: 500,
      deadline: '2026-09-30',
      daysRemaining: 10,
      verifiedStatus: { isVerified: true, attestedBy: 'Abbot', badgeLabel: 'Verified by Abbot ✓' },
      supportersCount: 15,
      icon: 'bowl',
      color: '#D97706',
    };

    const { container } = render(
      <LanguageProvider defaultLanguage="vi">
        <CauseFundCard fund={mockFund} />
      </LanguageProvider>
    );

    const article = container.querySelector('article');
    expect(article).toHaveClass('overflow-hidden');

    const header = article?.querySelector('.flex-wrap');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('justify-between');

    const badge = screen.getByText('Chứng thực bởi Thầy Trụ Trì ✓').closest('.rounded-full');
    expect(badge).toHaveClass('max-w-full');
    expect(badge?.querySelector('.truncate')).toBeInTheDocument();
  });

  it('translates verified badge to English when language is en even if fund has Vietnamese badgeLabel', () => {
    const mockFund: Fund = {
      id: 'alms',
      name: 'Daily Alms',
      description: 'Meal offerings',
      category: 'necessities',
      targetAmount: 1000,
      currentBalance: 500,
      deadline: '2026-09-30',
      daysRemaining: 10,
      verifiedStatus: { isVerified: true, attestedBy: 'Hòa Thượng Thích Tâm Đức', badgeLabel: 'Chứng thực bởi Thầy Trụ Trì ✓' },
      supportersCount: 15,
      icon: 'bowl',
      color: '#D97706',
    };

    render(
      <LanguageProvider defaultLanguage="en">
        <CauseFundCard fund={mockFund} />
      </LanguageProvider>
    );

    expect(screen.getByText('Verified by Abbot ✓')).toBeInTheDocument();
  });
});

describe('SanctuaryHome Tab', () => {
  it('renders daily teaching quote banner and all active cause cards from store', () => {
    const onOfferMock = vi.fn();

    render(
      <LanguageProvider>
        <MonasteryStoreProvider>
          <SanctuaryHome onOffer={onOfferMock} />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    // Daily teaching reflection
    expect(screen.getByText(/In giving, we find boundless peace/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Cause Funds/i)).toBeInTheDocument();

    // Check seed data funds are rendered
    expect(screen.getByText('Daily Alms & Nutritious Food')).toBeInTheDocument();
    expect(screen.getByText('Monastery Healthcare & Medicine')).toBeInTheDocument();
    expect(screen.getByText('Monastery Solar & Clean Water Utilities')).toBeInTheDocument();
    expect(screen.getByText('Dharma Texts & Sangha Education')).toBeInTheDocument();

    // Check offering buttons exist for each fund
    const offerButtons = screen.getAllByRole('button', { name: /Offer to this Cause/i });
    expect(offerButtons.length).toBe(4);

    // Clicking first button calls onOffer with first fund ID
    fireEvent.click(offerButtons[0]);
    expect(onOfferMock).toHaveBeenCalledWith('alms');
  });

  it('renders correctly in Vietnamese localization', () => {
    render(
      <LanguageProvider defaultLanguage="vi">
        <MonasteryStoreProvider>
          <SanctuaryHome />
        </MonasteryStoreProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Trong sự sẻ chia, ta tìm thấy an lạc vô biên/i)).toBeInTheDocument();
    expect(screen.getByText(/Các Quỹ Thiện Nguyện Hiện Tại/i)).toBeInTheDocument();

    const viOfferButtons = screen.getAllByRole('button', { name: /Cúng Dường Quỹ Này/i });
    expect(viOfferButtons.length).toBe(4);
  });
});
