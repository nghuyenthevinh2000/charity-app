import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import vi from './vi.json';

describe('Vietnamese Translation Full Coverage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('lotus_language', 'vi');
  });

  it('contains no English leftovers in parentheses in vi.json', () => {
    const jsonStr = JSON.stringify(vi);
    expect(jsonStr).not.toContain('(Digital Blessing Certificate)');
    expect(jsonStr).not.toContain('(Trace on UTXO Ledger)');
    expect(jsonStr).not.toContain('(View on Prayer Wall)');
  });

  it('translates fund names and categories on Sanctuary Home tab in Vietnamese', () => {
    render(<App />);

    // Fund names should be in Vietnamese
    expect(screen.getByText('Cúng Dường Trai Tăng & Thực Dưỡng')).toBeInTheDocument();
    expect(screen.queryByText('Daily Alms & Nutritious Food')).not.toBeInTheDocument();

    // Category should be in Vietnamese
    expect(screen.queryByText('NECESSITIES')).not.toBeInTheDocument();
    expect(screen.getByText(/Trai Tăng & Ẩm Thực|Nhu Yếu Phẩm/i)).toBeInTheDocument();

    // Verified badge in Vietnamese
    expect(screen.getAllByText('Chứng thực bởi Thầy Trụ Trì ✓').length).toBeGreaterThan(0);
    expect(screen.queryByText('Verified by Abbot ✓')).not.toBeInTheDocument();

    // Switch to English and verify verified badge translates to English
    fireEvent.click(screen.getByRole('button', { name: /English/i }));
    expect(screen.getAllByText('Verified by Abbot ✓').length).toBeGreaterThan(0);
    expect(screen.queryByText('Chứng thực bởi Thầy Trụ Trì ✓')).not.toBeInTheDocument();
  });

  it('translates UTXO Ledger and Provenance Search in Vietnamese', () => {
    render(<App />);

    // Switch to Transparency tab
    const transparencyTab = screen.getByRole('button', { name: /Minh Bạch/i });
    fireEvent.click(transparencyTab);

    // Check no untranslated headers or labels
    expect(screen.queryByText('Monastery Audited')).not.toBeInTheDocument();
    expect(screen.getByText(/Tu Viện Đã Kiểm Toán|Kiểm Toán Tu Viện/i)).toBeInTheDocument();

    expect(screen.queryByText('Sample:')).not.toBeInTheDocument();
    expect(screen.getByText(/Mẫu:|Ví dụ:/i)).toBeInTheDocument();

    // Inspect Bill button text
    expect(screen.queryByText('Inspect Bill')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Xem Hóa Đơn/i).length).toBeGreaterThan(0);
  });

  it('translates Prayer Wall and prayer cards in Vietnamese', () => {
    render(<App />);

    // Switch to Prayer Wall tab
    const prayerWallTab = screen.getByRole('button', { name: /Sổ Cầu Nguyện/i });
    fireEvent.click(prayerWallTab);

    // Blessed status should not be English
    expect(screen.queryByText('Blessed in Morning Chanting • 6:00 AM 🪷')).not.toBeInTheDocument();
    expect(screen.queryByText('⏳ Queued for Morning Chanting')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Đã chú nguyện trong thời khóa công phu sáng • 6:00 (Sáng|AM) 🪷/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Đang chờ thời khóa (công phu sáng|tụng kinh buổi sáng)/i).length).toBeGreaterThan(0);
  });

  it('translates Steward Portal and PIN modal in Vietnamese', () => {
    render(<App />);

    // Click Steward tab to open PIN modal
    const stewardTab = screen.getByRole('button', { name: /Quản Sự/i });
    fireEvent.click(stewardTab);

    // PIN placeholder shouldn't be in English
    expect(screen.queryByPlaceholderText('Enter PIN (1080)')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập mã PIN (1080)')).toBeInTheDocument();

    // Unlock steward
    fireEvent.click(screen.getByText('1080'));
    fireEvent.click(screen.getByRole('button', { name: /Xác Nhận|Mở Khóa/i }));

    // In Steward Portal
    expect(screen.queryByText('Total Target')).not.toBeInTheDocument();
    expect(screen.getByText(/Tổng Mục Tiêu/i)).toBeInTheDocument();
  });

  it('translates Blessing Certificate without English in parentheses', () => {
    render(<App />);

    // Click offer on first fund
    const offerButtons = screen.getAllByRole('button', { name: /Cúng Dường Quỹ Này/i });
    fireEvent.click(offerButtons[0]);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('$35'));
    fireEvent.click(screen.getByRole('button', { name: /Tiếp Tục/i }));

    // Step 2 -> Submit
    fireEvent.click(screen.getByRole('button', { name: /Gửi Cúng Dường/i }));

    // Certificate title should NOT have English in parentheses
    expect(screen.queryByText(/Digital Blessing Certificate/i)).not.toBeInTheDocument();
    expect(screen.getByText('Chứng Nhận Công Đức')).toBeInTheDocument();

    // Action buttons on certificate
    expect(screen.queryByText(/Trace on UTXO Ledger/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/View on Prayer Wall/i)).not.toBeInTheDocument();
    expect(screen.getByText('Truy Xuất Trên Sổ UTXO')).toBeInTheDocument();
    expect(screen.getByText('Xem Trên Sổ Cầu Nguyện')).toBeInTheDocument();
  });
});
