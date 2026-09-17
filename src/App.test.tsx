import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App smoke test', () => {
  it('renders app title', () => {
    render(<App />);
    expect(screen.getByText(/Lotus Grove/i)).toBeInTheDocument();
  });
});
