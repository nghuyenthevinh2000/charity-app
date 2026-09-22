import React, { useState } from 'react';
import { Shield, Lock, Check, Copy, Globe } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { PersonalPurchases } from '../proof/PersonalPurchases';

export interface ProfileViewProps {
  onRequestStewardUnlock?: () => void;
  onNavigateToSteward?: () => void;
  onViewProof?: (proofOrPackageId: string) => void;
}

const SMART_CONTRACT_ADDRESS = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d';

export const ProfileView: React.FC<ProfileViewProps> = ({
  onRequestStewardUnlock,
  onNavigateToSteward,
  onViewProof,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { isStewardUnlocked, lockSteward } = useMonasteryStore();
  const [copiedContract, setCopiedContract] = useState(false);

  const handleCopyContract = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(SMART_CONTRACT_ADDRESS);
      }
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } catch {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* 1. UNIFIED HEADER (MATCHING MONK PORTAL DESIGN) */}
      <header
        className="flex items-center justify-between border-b border-stone-200 pb-3.5"
        aria-label="Devotee Identity"
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-snug">
              {t('profile.devoteeTitle')}
            </h1>
            {isStewardUnlocked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-full">
                <Shield className="w-2.5 h-2.5 text-amber-700" />
                <span>{t('profile.monkModeBadge')}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 mt-0.5 font-medium">
            {t('profile.devoteeSubtitle')}
          </p>
        </div>

        {/* Right Role Action (Matching Monk Portal Button Style) */}
        {!isStewardUnlocked ? (
          <button
            type="button"
            onClick={onRequestStewardUnlock}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
            aria-label={t('profile.stewardLoginBtn')}
            title="Monk Steward Login (PIN 1080)"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('profile.stewardLoginBtn')}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            {onNavigateToSteward && (
              <button
                type="button"
                onClick={onNavigateToSteward}
                className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                aria-label={t('profile.switchToSteward')}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{t('profile.switchToSteward')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={lockSteward}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title={t('profile.lockSteward')}
              aria-label={t('profile.lockSteward')}
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>{t('profile.lockSteward')}</span>
            </button>
          </div>
        )}
      </header>

      {/* 2. LANGUAGE PREFERENCES SECTION (IN BODY) */}
      <section
        className="bg-white rounded-2xl p-3.5 sm:p-4 border border-stone-200 shadow-2xs space-y-2.5"
        aria-label="Language Preferences"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-500" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {t('profile.languageTitle')}
            </h2>
          </div>
          <span className="text-[11px] text-stone-500">{t('profile.languageSubtitle')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Language selection">
          <button
            type="button"
            onClick={() => setLanguage('vi')}
            aria-pressed={language === 'vi'}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              language === 'vi'
                ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold shadow-2xs'
                : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
            }`}
            aria-label="Tiếng Việt (VI)"
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">🇻🇳</span>
              <span>Tiếng Việt (VI)</span>
            </span>
            {language === 'vi' && <Check className="w-3.5 h-3.5 text-saffron-700" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold shadow-2xs'
                : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
            }`}
            aria-label="English (EN)"
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">🇬🇧</span>
              <span>English (EN)</span>
            </span>
            {language === 'en' && <Check className="w-3.5 h-3.5 text-saffron-700" />}
          </button>
        </div>
      </section>

      {/* 3. PERSONAL GIVING & PACKAGE TRACKER */}
      <section aria-label="Personal Giving Tracker">
        <PersonalPurchases onViewProof={onViewProof} />
      </section>

      {/* 4. SANCTUARY & ON-CHAIN BLOCKCHAIN LEDGER INFO */}
      <section
        className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm text-xs text-stone-600 space-y-3"
        aria-label="Sanctuary and Blockchain Info"
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('profile.sanctuaryTitle')}
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            {t('profile.version')}
          </span>
        </div>

        {/* Smart Contract address row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/70">
          <div>
            <div className="font-semibold text-stone-800">{t('profile.smartContract')}</div>
            <div className="font-mono text-[11px] text-stone-500 break-all mt-0.5">
              {SMART_CONTRACT_ADDRESS}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyContract}
            className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-medium transition-colors"
          >
            {copiedContract ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">{t('common.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-stone-500" />
                <span>{t('common.copy')}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>✓ {t('profile.verificationStatus')}</span>
        </div>

        <p className="text-[11px] text-stone-500 leading-relaxed border-t border-stone-100 pt-2.5">
          {t('profile.missionDispatch')}
        </p>
      </section>
    </div>
  );
};

export default ProfileView;
