import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LanguageProvider, useTranslation } from './LanguageContext';
import { useTranslation as useTranslationHook } from '../hooks/useTranslation';

function TestConsumer() {
  const { t, language, setLanguage } = useTranslation();
  return (
    <div>
      <span data-testid="title">{t('common.appName')}</span>
      <span data-testid="lang">{language}</span>
      <span data-testid="interpolated">
        {t('sanctuary.raisedOf', { current: '$5,000', target: '$10,000', pct: 50 })}
      </span>
      <span data-testid="missing">{t('nonexistent.nested.key')}</span>
      <button onClick={() => setLanguage('vi')}>Switch to VI</button>
      <button onClick={() => setLanguage('en')}>Switch to EN</button>
    </div>
  );
}

function HookConsumer() {
  const { t, language } = useTranslationHook();
  return (
    <div>
      <span data-testid="hook-title">{t('common.appName')}</span>
      <span data-testid="hook-lang">{language}</span>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to English and switches to Vietnamese', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('title')).toHaveTextContent('Lotus Grove Sanctuary');
    expect(screen.getByTestId('lang')).toHaveTextContent('en');

    fireEvent.click(screen.getByText('Switch to VI'));
    expect(screen.getByTestId('title')).toHaveTextContent('Tịnh Xá Sen Vàng');
    expect(screen.getByTestId('lang')).toHaveTextContent('vi');
    expect(localStorage.getItem('lotus_language')).toBe('vi');

    fireEvent.click(screen.getByText('Switch to EN'));
    expect(screen.getByTestId('title')).toHaveTextContent('Lotus Grove Sanctuary');
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(localStorage.getItem('lotus_language')).toBe('en');
  });

  it('interpolates parameters correctly in translations', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('interpolated')).toHaveTextContent(
      '$5,000 / $10,000 target (50%)'
    );

    fireEvent.click(screen.getByText('Switch to VI'));
    expect(screen.getByTestId('interpolated')).toHaveTextContent(
      '$5,000 / mục tiêu $10,000 (50%)'
    );
  });

  it('returns raw key if translation is missing', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('missing')).toHaveTextContent('nonexistent.nested.key');
  });

  it('initializes from persisted localStorage if available', () => {
    localStorage.setItem('lotus_language', 'vi');
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('title')).toHaveTextContent('Tịnh Xá Sen Vàng');
    expect(screen.getByTestId('lang')).toHaveTextContent('vi');
  });

  it('works when imported from src/hooks/useTranslation', () => {
    render(
      <LanguageProvider>
        <HookConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('hook-title')).toHaveTextContent('Lotus Grove Sanctuary');
    expect(screen.getByTestId('hook-lang')).toHaveTextContent('en');
  });

  it('throws an error when useTranslation is called outside of LanguageProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useTranslation must be used within a LanguageProvider'
    );
    consoleSpy.mockRestore();
  });

  it('supports defaultLanguage prop when no saved language exists', () => {
    render(
      <LanguageProvider defaultLanguage="vi">
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('title')).toHaveTextContent('Tịnh Xá Sen Vàng');
    expect(screen.getByTestId('lang')).toHaveTextContent('vi');
  });

  it('preserves unresolved placeholders if param not supplied', () => {
    function PartialConsumer() {
      const { t } = useTranslation();
      return (
        <span data-testid="partial">
          {t('sanctuary.raisedOf', { current: '$1,000' })}
        </span>
      );
    }
    render(
      <LanguageProvider>
        <PartialConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('partial')).toHaveTextContent(
      '$1,000 / {{target}} target ({{pct}}%)'
    );
  });
});

