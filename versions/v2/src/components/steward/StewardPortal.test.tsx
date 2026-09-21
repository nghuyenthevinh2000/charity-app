import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StewardPortal } from './StewardPortal';
import { MonasteryProvider } from '../../context/MonasteryStore';
import { LanguageProvider } from '../../context/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <MonasteryProvider>{ui}</MonasteryProvider>
    </LanguageProvider>
  );
};

describe('StewardPortal (Tab 3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('demands PIN 1080 when locked and unlocks upon correct entry', () => {
    renderWithProviders(<StewardPortal />);
    expect(screen.getByText(/Monk Steward Access/i)).toBeInTheDocument();

    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    expect(screen.getByText(/Monastery Steward Workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ create charity package/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload proof of giving/i })).toBeInTheDocument();
  });

  it('rejects incorrect PIN entry', () => {
    renderWithProviders(<StewardPortal />);
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '9999' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    expect(screen.getByText(/incorrect pin/i)).toBeInTheDocument();
  });

  it('opens Create Package modal and adds new package', () => {
    renderWithProviders(<StewardPortal />);
    // Unlock
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    // Click create package
    fireEvent.click(screen.getByRole('button', { name: /\+ create charity package/i }));
    expect(screen.getByText(/Create New Charity Package/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/package title/i), { target: { value: 'Flood Relief Pack' } });
    fireEvent.change(screen.getByLabelText(/unit price/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/target units/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/items included/i), { target: { value: 'Dry Rations, Water Purifier, First Aid' } });

    fireEvent.click(screen.getByRole('button', { name: /publish package/i }));
    expect(screen.getByText('Flood Relief Pack')).toBeInTheDocument();
  });

  it('validates input in Create Package modal', () => {
    renderWithProviders(<StewardPortal />);
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    fireEvent.click(screen.getByRole('button', { name: /\+ create charity package/i }));
    // Clear title and submit
    fireEvent.change(screen.getByLabelText(/package title/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /publish package/i }));

    expect(screen.getByText(/please provide a package title/i)).toBeInTheDocument();
  });

  it('opens Upload Proof modal and records distribution proof', () => {
    renderWithProviders(<StewardPortal />);
    // Unlock
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    // Click upload proof
    fireEvent.click(screen.getByRole('button', { name: /upload proof of giving/i }));
    expect(screen.getByRole('heading', { name: /Upload Proof of Giving/i })).toBeInTheDocument();

    // Select package and enter distribution details
    fireEvent.change(screen.getByLabelText(/units distributed/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/village|location/i), { target: { value: 'Lung Cu Village' } });
    fireEvent.change(screen.getByLabelText(/mission report/i), {
      target: { value: 'Distributed warm jackets and rice sacks directly to mountain households.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /seal & record proof/i }));

    // Modal should close
    expect(screen.queryByText(/Attach field delivery photo/i)).not.toBeInTheDocument();
  });

  it('allows opening upload proof modal directly from package card', () => {
    renderWithProviders(<StewardPortal />);
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));

    // Find upload proof button on card
    const cardProofBtns = screen.getAllByRole('button', { name: /^Upload Proof$/i });
    expect(cardProofBtns.length).toBeGreaterThan(0);
    fireEvent.click(cardProofBtns[0]);

    expect(screen.getByRole('heading', { name: /Upload Proof of Giving/i })).toBeInTheDocument();
  });

  it('allows locking the portal and triggers onLock callback', () => {
    const handleLock = vi.fn();
    renderWithProviders(<StewardPortal onLock={handleLock} />);

    // Unlock first
    const pinInput = screen.getByLabelText(/enter steward pin/i);
    fireEvent.change(pinInput, { target: { value: '1080' } });
    fireEvent.click(screen.getByRole('button', { name: /unlock portal/i }));
    expect(screen.getByText(/Monastery Steward Workspace/i)).toBeInTheDocument();

    // Lock portal
    fireEvent.click(screen.getByRole('button', { name: /lock portal/i }));
    expect(handleLock).toHaveBeenCalled();
    expect(screen.getByText(/Monk Steward Access/i)).toBeInTheDocument();
  });
});
