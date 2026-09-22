import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import vi from './vi.json';

describe('V2 Vietnamese Translation Full Coverage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('lotus_language', 'vi');
  });

  it('contains no English leftovers in parentheses in vi.json', () => {
    const jsonStr = JSON.stringify(vi);
    expect(jsonStr).not.toContain('(Digital Blessing Certificate)');
  });

  it('translates marketplace and tabs in Vietnamese', () => {
    render(<App />);

    // Tabs in Vietnamese (Devotee mode shows Hồ Sơ for Tab 3)
    expect(screen.getByRole('button', { name: /Gói Thiện Nguyện/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Khám Phá Minh Chứng/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hồ Sơ/i })).toBeInTheDocument();
  });

  it('translates Proof Explorer in Vietnamese', () => {
    render(<App />);

    // Switch to Proof Explorer tab
    fireEvent.click(screen.getByRole('button', { name: /Khám Phá Minh Chứng/i }));
    expect(screen.getByRole('tabpanel', { name: /Public Field Proofs/i })).toBeInTheDocument();
  });

  it('translates Steward Portal PIN modal in Vietnamese', () => {
    render(<App />);

    // Click Profile tab in Vietnamese mode
    fireEvent.click(screen.getByRole('button', { name: /Hồ Sơ/i }));

    // Click Steward login button in ProfileView
    fireEvent.click(screen.getByRole('button', { name: /Đăng Nhập Quản Sự Chùa/i }));

    // PIN modal in Vietnamese
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Xác Thực Quản Sự/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập mã PIN (1080)')).toBeInTheDocument();
  });
});
