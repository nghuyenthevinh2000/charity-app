import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock, Check, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useMonasteryStore } from '../../context/MonasteryStore';

export type AppRole = 'devotee' | 'steward';

export interface HeaderProps {
  currentRole?: AppRole;
  onSelectRole?: (role: AppRole) => void;
  onRequestStewardUnlock?: () => void;
  onResetStore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole = 'devotee',
  onSelectRole,
  onRequestStewardUnlock,
  onResetStore,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { isStewardUnlocked, packages, proofBatches, resetStore } = useMonasteryStore();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const devoteeLabel = t('common.devoteeRole');
  const stewardLabel = t('common.stewardRole');
  const activeRoleLabel = currentRole === 'steward' ? stewardLabel : devoteeLabel;

  const handleReset = () => {
    if (onResetStore) {
      onResetStore();
    } else {
      resetStore();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-parchment-300 px-3 py-2.5 flex items-center justify-between shadow-2xs">
      {/* Brand & Lotus Emblem */}
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 48 48"
          className="w-7 h-7 shrink-0 filter drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M24 6c-1.5 5.5-5 11-10 14.5 4-1 8-4 10-8 2 4 6 7 10 8-5-3.5-8.5-9-10-14.5z"
            fill="#F59E0B"
          />
          <path
            d="M24 14c-2 6-7 11.5-14 14 5.5-1 10.5-4.5 14-9.5 3.5 5 8.5 8.5 14 9.5-7-2.5-12-8-14-14z"
            fill="#D97706"
          />
          <path
            d="M24 22c-3.5 5-9.5 9-17 10 7 1 14-2 17-6 3 4 10 7 17 6-7.5-1-13.5-5-17-10z"
            fill="#B45309"
          />
          <circle cx="24" cy="38" r="2.5" fill="#F59E0B" />
        </svg>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="font-serif font-bold text-stone-900 text-xs sm:text-sm leading-tight">
              {t('common.appName')}
            </h1>
            <span className="text-[9px] font-sans font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-300">
              {t('common.v2Badge') || 'v2.0 Packaged Giving'}
            </span>
          </div>
          <div className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
            <span>📦 {packages.length} {t('common.packagesCount') || 'Packages'}</span>
            <span>•</span>
            <span>📸 {proofBatches.length} {t('common.proofsCount') || 'Verified Proofs'}</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Demo Reset, Language pill & Role pill */}
      <div className="flex items-center gap-1.5">
        {/* Demo Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-xs font-medium border border-stone-300 transition-colors"
          title="Reset Demo Data"
          aria-label={t('common.demoReset') || 'Demo Reset'}
        >
          <RotateCcw className="w-3 h-3 text-stone-500" />
          <span className="hidden sm:inline">{t('common.demoReset') || 'Reset'}</span>
        </button>

        {/* Language switcher pill [🇻🇳 VI | 🇬🇧 EN] */}
        <div
          className="flex items-center bg-parchment-200 rounded-full p-0.5 border border-parchment-300"
          role="group"
          aria-label="Language selection"
        >
          <button
            type="button"
            onClick={() => setLanguage('vi')}
            className={`px-1.5 py-0.5 rounded-full text-xs transition-all ${
              language === 'vi'
                ? 'bg-saffron-600 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 font-medium'
            }`}
            aria-label="Tiếng Việt (VI)"
          >
            🇻🇳 VI
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-1.5 py-0.5 rounded-full text-xs transition-all ${
              language === 'en'
                ? 'bg-saffron-600 text-white font-semibold shadow-xs'
                : 'text-stone-600 hover:text-stone-900 font-medium'
            }`}
            aria-label="English (EN)"
          >
            🇬🇧 EN
          </button>
        </div>

        {/* Role Pill dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            type="button"
            onClick={() => setIsRoleMenuOpen((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all ${
              currentRole === 'steward'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
            }`}
            aria-label={activeRoleLabel}
            aria-expanded={isRoleMenuOpen}
          >
            <span>{activeRoleLabel}</span>
            <ChevronDown
              className={`w-3 h-3 text-stone-500 transition-transform ${
                isRoleMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50">
              <button
                type="button"
                onClick={() => {
                  setIsRoleMenuOpen(false);
                  onSelectRole?.('devotee');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-parchment-100 transition-colors ${
                  currentRole === 'devotee'
                    ? 'text-saffron-800 font-semibold bg-amber-50/60'
                    : 'text-stone-700'
                }`}
              >
                <span>{devoteeLabel}</span>
                {currentRole === 'devotee' && <Check className="w-3.5 h-3.5 text-saffron-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRoleMenuOpen(false);
                  if (isStewardUnlocked) {
                    onSelectRole?.('steward');
                  } else {
                    onRequestStewardUnlock?.();
                  }
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-parchment-100 transition-colors ${
                  currentRole === 'steward'
                    ? 'text-saffron-800 font-semibold bg-amber-50/60'
                    : 'text-stone-700'
                }`}
              >
                <div className="flex flex-col">
                  <span>{stewardLabel}</span>
                  {!isStewardUnlocked && (
                    <span className="text-[10px] text-stone-400">{t('common.pinHint')}</span>
                  )}
                </div>
                {currentRole === 'steward' ? (
                  <Check className="w-3.5 h-3.5 text-saffron-600" />
                ) : (
                  !isStewardUnlocked && <Lock className="w-3 h-3 text-stone-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
