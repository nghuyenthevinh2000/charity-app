import React, { useState } from 'react';
import { Shield, KeyRound, X, AlertCircle } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';

export interface StewardPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StewardPinModal: React.FC<StewardPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { unlockSteward } = useMonasteryStore();
  const { language, t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập mã PIN' : 'Please enter PIN');
      return;
    }

    const success = unlockSteward(pin.trim());
    if (success) {
      setPin('');
      setError(null);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(
        language === 'vi'
          ? 'Mã PIN không chính xác. Mã mặc định là 1080.'
          : 'Incorrect PIN. Default is 1080.'
      );
    }
  };

  const handleClose = () => {
    setPin('');
    setError(null);
    onClose();
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="steward-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-parchment-300 relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-3 text-saffron-700 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h2 id="steward-modal-title" className="text-xl font-serif font-bold text-stone-900">
            {language === 'vi' ? 'Xác Thực Quản Sự' : 'Steward Authentication'}
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {language === 'vi'
              ? 'Nhập mã PIN ban quản sự để quản lý quỹ và chi tiêu (Mặc định: 1080)'
              : 'Enter monastery steward PIN to manage funds and expenses (Default: 1080)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder={t('steward.enterPinPlaceholder')}
                aria-label={t('steward.stewardPinAria')}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 text-center tracking-widest text-lg font-mono rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 focus:border-transparent transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-600 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick tactile keypad */}
          <div className="grid grid-cols-3 gap-2 py-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-2.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 text-stone-800 font-medium text-base active:scale-95 transition-all shadow-xs"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 text-stone-600 text-xs font-medium active:scale-95 transition-all"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-2.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 text-stone-800 font-medium text-base active:scale-95 transition-all shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => {
                setPin('1080');
                setError(null);
              }}
              className="py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-saffron-800 text-xs font-semibold active:scale-95 transition-all border border-amber-200"
              title={t('steward.quickFill')}
            >
              1080
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-sm transition-colors"
            >
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-medium text-sm transition-colors shadow-xs"
            >
              {language === 'vi' ? 'Mở Khóa' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StewardPinModal;
