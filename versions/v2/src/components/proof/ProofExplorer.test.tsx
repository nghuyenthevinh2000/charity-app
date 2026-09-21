import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { ProofExplorer } from './ProofExplorer';
import { MonasteryProvider } from '../../context/MonasteryStore';
import { LanguageProvider } from '../../context/LanguageContext';
import { initialPurchases } from '../../data/seedDataV2';

const renderWithProviders = (ui: React.ReactElement, initialUserPurchases = initialPurchases) => {
  return render(
    <LanguageProvider>
      <MonasteryProvider initialUserPurchases={initialUserPurchases}>{ui}</MonasteryProvider>
    </LanguageProvider>
  );
};

describe('ProofExplorer (Tab 2)', () => {
  it('renders screen-filling campaign proof card with background photo and details without free-scroll nav bar', () => {
    renderWithProviders(<ProofExplorer />);
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
    expect(screen.getByText(/Dong Van Highland Village/i)).toBeInTheDocument();
    expect(screen.getByText(/Block #18942/i)).toBeInTheDocument();
    // Sub-nav is removed per user request
    expect(screen.queryByRole('navigation', { name: /proof explorer navigation/i })).not.toBeInTheDocument();
  });

  it('switches cleanly between campaign cards using next and previous buttons', () => {
    renderWithProviders(<ProofExplorer />);
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
    expect(screen.getByText(/Mission 1 of 2/i)).toBeInTheDocument();

    const nextCampaignBtn = screen.getByRole('button', { name: /next campaign/i });
    fireEvent.click(nextCampaignBtn);

    expect(screen.getByText('Highland Student Study Pack')).toBeInTheDocument();
    expect(screen.getByText(/Mission 2 of 2/i)).toBeInTheDocument();

    const prevCampaignBtn = screen.getByRole('button', { name: /previous campaign/i });
    fireEvent.click(prevCampaignBtn);

    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
  });

  it('toggles Details 50% drawer when info icon is clicked and collapses on second click', () => {
    renderWithProviders(<ProofExplorer />);
    const infoBtn = screen.getByRole('button', { name: /toggle proof details/i });

    // Open Details
    fireEvent.click(infoBtn);
    expect(screen.getByText(/Mission Report & Merkle Seal/i)).toBeInTheDocument();
    expect(screen.getByText(/sha256:/i)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(infoBtn);
    expect(screen.queryByText(/Mission Report & Merkle Seal/i)).not.toBeInTheDocument();
  });

  it('enforces mutual exclusivity: opening comments collapses details drawer', () => {
    renderWithProviders(<ProofExplorer />);
    const infoBtn = screen.getByRole('button', { name: /toggle proof details/i });
    const commentBtn = screen.getByRole('button', { name: /toggle comments/i });

    // Open details
    fireEvent.click(infoBtn);
    expect(screen.getByText(/Mission Report & Merkle Seal/i)).toBeInTheDocument();

    // Click comments
    fireEvent.click(commentBtn);
    expect(screen.queryByText(/Mission Report & Merkle Seal/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Sangha Reflections & Community Notes/i)).toBeInTheDocument();
  });

  it('allows posting a comment in the comments bottom sheet', () => {
    renderWithProviders(<ProofExplorer />);
    const commentBtn = screen.getByRole('button', { name: /toggle comments/i });
    fireEvent.click(commentBtn);

    const input = screen.getByPlaceholderText(/share a reflection or rejoice/i);
    const postBtn = screen.getByRole('button', { name: /post/i });

    fireEvent.change(input, { target: { value: 'Wonderful compassionate effort!' } });
    fireEvent.click(postBtn);

    expect(screen.getByText('Wonderful compassionate effort!')).toBeInTheDocument();
  });

  it('renders Personal Purchases view when initialSubTab is personal for future usage', () => {
    renderWithProviders(<ProofExplorer initialSubTab="personal" />);
    expect(screen.getByText(/Your Personal Giving Tracker/i)).toBeInTheDocument();
  });

  it('navigates through heartfelt photos using next and previous buttons', () => {
    renderWithProviders(<ProofExplorer />);
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();

    const nextBtn = screen.getAllByRole('button', { name: /next photo/i })[0];
    fireEvent.click(nextBtn);

    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();

    const prevBtn = screen.getAllByRole('button', { name: /previous photo/i })[0];
    fireEvent.click(prevBtn);

    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it('navigates from personal purchase to public proof card when clicking view photo proof', () => {
    renderWithProviders(<ProofExplorer initialSubTab="personal" />);

    const viewProofBtn = screen.getAllByRole('button', { name: /view delivery photo proof/i })[0];
    fireEvent.click(viewProofBtn);

    // Should navigate back to public proof view
    expect(screen.getByText('Winter Warmth & Rice Kit')).toBeInTheDocument();
  });

  it('displays empty state when devotee has no purchases in session', () => {
    renderWithProviders(<ProofExplorer initialSubTab="personal" />, []);

    expect(
      screen.getByText(/No packages sponsored yet in this session/i)
    ).toBeInTheDocument();
  });

  it('allows closing drawer via close button (X button)', () => {
    renderWithProviders(<ProofExplorer />);
    const infoBtn = screen.getByRole('button', { name: /toggle proof details/i });
    fireEvent.click(infoBtn);
    expect(screen.getByText(/Mission Report & Merkle Seal/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close drawer/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Mission Report & Merkle Seal/i)).not.toBeInTheDocument();
  });

  it('allows copying the Merkle root hash in Details drawer', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderWithProviders(<ProofExplorer />);
    const infoBtn = screen.getByRole('button', { name: /toggle proof details/i });
    fireEvent.click(infoBtn);

    const copyBtn = screen.getByRole('button', { name: /copy merkle root/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('sha256:'));
  });

  it('filters personal purchases using search query', () => {
    renderWithProviders(<ProofExplorer initialSubTab="personal" />);

    const searchInput = screen.getByPlaceholderText(/search by your personal tx hash/i);
    fireEvent.change(searchInput, { target: { value: 'Winter Warmth' } });

    expect(screen.getByText(/Winter Warmth & Rice Kit/i)).toBeInTheDocument();
    expect(screen.queryByText(/Highland Student Study Pack/i)).not.toBeInTheDocument();
  });

  it('elevates floating action dock above 50% bottom sheet drawer when opened', () => {
    renderWithProviders(<ProofExplorer />);
    const infoBtn = screen.getByRole('button', { name: /toggle proof details/i });
    const dock = infoBtn.closest('aside');
    expect(dock).toHaveClass('bottom-6');

    // Open drawer
    fireEvent.click(infoBtn);
    expect(dock).toHaveClass('bottom-[calc(50%+1rem)]');

    // Close drawer
    fireEvent.click(infoBtn);
    expect(dock).toHaveClass('bottom-6');
  });

  it('handles initialProofId prop by targeting and displaying the matched proof card', async () => {
    renderWithProviders(<ProofExplorer initialProofId="proof-student-batch-1" initialSubTab="personal" />);

    expect(screen.getByText('Highland Student Study Pack')).toBeInTheDocument();
    expect(screen.getByText(/Nam Dam Primary School/i)).toBeInTheDocument();
    expect(screen.getByText(/Mission 2 of 2/i)).toBeInTheDocument();
  });
});
