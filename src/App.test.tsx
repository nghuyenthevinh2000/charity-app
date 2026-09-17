import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App smoke test', () => {
  it('renders app title', () => {
    render(<App />);
    expect(screen.getByText(/Lotus Grove/i)).toBeInTheDocument();
  });

  it('renders sanctuary home tab with cause funds on default load', () => {
    render(<App />);
    expect(screen.getByText(/Active Cause Funds/i)).toBeInTheDocument();
    expect(screen.getByText('Daily Alms & Nutritious Food')).toBeInTheDocument();
    const offerButtons = screen.getAllByRole('button', { name: /Offer to this Cause/i });
    expect(offerButtons.length).toBeGreaterThan(0);
  });
});

