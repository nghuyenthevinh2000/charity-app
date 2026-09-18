import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  MessageSquareQuote,
  Copy,
  Check,
  HeartHandshake,
} from 'lucide-react';
import { DonationInput } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { getPrayerDedication } from '../../utils/localization';

export interface BlessingCertificateProps {
  donation: DonationInput;
  fundName: string;
  onNavigateToLedger?: (txHash: string) => void;
  onNavigateToPrayerWall?: () => void;
  onClose?: () => void;
}

export const BlessingCertificate: React.FC<BlessingCertificateProps> = ({
  donation,
  fundName,
  onNavigateToLedger,
  onNavigateToPrayerWall,
  onClose,
}) => {
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyTx = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(donation.txHash).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryLabel = (cat?: string) => {
    switch (cat) {
      case 'healing':
        return t('offeringModal.catHealing');
      case 'memorial':
        return t('offeringModal.catMemorial');
      case 'peace':
        return t('offeringModal.catPeace');
      case 'gratitude':
        return t('offeringModal.catGratitude');
      default:
        return cat || '';
    }
  };

  const formattedAmount = `$${donation.amount.toLocaleString()}`;
  const formattedDate = donation.date || new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5" aria-label={t('offeringModal.certificateTitle')}>
      {/* Sacred Parchment Certificate Card */}
      <div className="relative bg-gradient-to-b from-amber-50/80 via-white to-amber-50/60 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden">
        {/* Ornate Zen Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center space-y-2">
          {/* Gold Lotus Seal */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-stone-900 shadow-md ring-4 ring-amber-200/60 mx-auto">
            <span className="text-2xl select-none" role="img" aria-label={t('offeringModal.lotusSeal')}>
              🪷
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60">
              {t('offeringModal.lotusSeal')}
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mt-1">
              {t('offeringModal.certificateTitle')}
            </h3>
            <p className="text-xs text-stone-600 font-serif italic">
              {t('offeringModal.certificateSubtitle')}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-dashed border-amber-200" />

        {/* Main Certificate Content */}
        <div className="space-y-3.5 text-center">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500">
              {t('offeringModal.amountOffered')}
            </span>
            <div className="text-3xl font-serif font-bold text-saffron-700">
              {formattedAmount}
            </div>
            <div className="text-xs font-medium text-stone-700 mt-0.5">
              {fundName}
            </div>
          </div>

          {/* Devotee Dedication */}
          <div className="bg-white/80 rounded-xl p-3 border border-amber-200/80 shadow-2xs text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">
                {t('offeringModal.donorLabel')}:
              </span>
              <span className="font-semibold text-stone-900">
                {donation.donorName}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">
                {language === 'vi' ? 'Ngày phát tâm' : 'Date'}:
              </span>
              <span className="font-mono text-stone-700">
                {formattedDate}
              </span>
            </div>

            {donation.prayerIntention && (
              <>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-100">
                  <span className="text-stone-500 font-medium">
                    {t('offeringModal.intentionCategory')}:
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    {getCategoryLabel(donation.prayerIntention.category)}
                  </span>
                </div>

                <div className="pt-1">
                  <div className="flex items-start gap-1.5 text-xs italic text-stone-700 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    <MessageSquareQuote className="w-4 h-4 text-saffron-600 shrink-0 mt-0.5" />
                    <span>"{getPrayerDedication(donation.prayerIntention, t)}"</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cryptographic UTXO TX Hash Proof */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-2.5 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span className="font-medium">{t('offeringModal.txHashLabel')}</span>
              <button
                type="button"
                onClick={handleCopyTx}
                className="hover:text-white transition-colors flex items-center gap-1 text-[10px] text-amber-300 cursor-pointer"
                title={t('offeringModal.copyTxHash')}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{t('common.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t('common.copy')}</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-amber-300 font-bold break-all select-all">
              {donation.txHash}
            </div>
          </div>

          {/* Spiritual Blessing Stanza */}
          <p className="text-[11px] font-serif text-stone-600 italic px-2 leading-relaxed">
            "{t('offeringModal.blessingNote')}"
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full border border-emerald-200 w-fit mx-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === 'vi'
                ? 'Đã ghi nhận vào thời khóa công phu tu viện ✓'
                : 'Enrolled in Morning Chanting Service ✓'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Links & Navigation Buttons */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => onNavigateToLedger?.(donation.txHash)}
          className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-black text-amber-300 font-medium text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>{t('offeringModal.traceOnLedger')}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateToPrayerWall?.()}
          className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 text-amber-900 font-medium text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <HeartHandshake className="w-4 h-4 text-saffron-700" />
          <span>{t('offeringModal.viewOnPrayerWall')}</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer"
          >
            {t('offeringModal.close')}
          </button>
        )}
      </div>
    </div>
  );
};

export default BlessingCertificate;
