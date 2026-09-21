import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { CauseFundCard } from '../sanctuary/CauseFundCard';
import { OfferingModal } from '../modals/OfferingModal';

export interface SanctuaryHomeProps {
  onOffer?: (fundId: string) => void;
  onNavigateToLedger?: (txHash: string) => void;
  onNavigateToPrayerWall?: () => void;
}

export const SanctuaryHome: React.FC<SanctuaryHomeProps> = ({
  onOffer,
  onNavigateToLedger,
  onNavigateToPrayerWall,
}) => {
  const { funds } = useMonasteryStore();
  const { t } = useTranslation();
  const [internalOfferingFundId, setInternalOfferingFundId] = useState<string | null>(null);

  const handleOffer = (fundId: string) => {
    if (onOffer) {
      onOffer(fundId);
    } else {
      setInternalOfferingFundId(fundId);
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-5" aria-label="Sanctuary Home">
      {/* Daily Teaching Reflection Banner */}
      <section
        className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-center shadow-2xs relative overflow-hidden"
        aria-label={t('sanctuary.dailyTeachingLabel')}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1 text-saffron-800">
          <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            {t('sanctuary.dailyTeachingLabel')}
          </span>
        </div>
        <blockquote className="text-sm font-serif italic text-stone-800 leading-snug">
          "{t('sanctuary.dailyTeachingQuote')}"
        </blockquote>
      </section>

      {/* Active Causes Section */}
      <section className="space-y-3" aria-label={t('sanctuary.activeCauses')}>
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-serif font-bold text-stone-900">
            {t('sanctuary.activeCauses')}
          </h2>
          <span className="text-xs text-stone-600 font-medium bg-parchment-200/80 px-2.5 py-0.5 rounded-full">
            {funds.length}
          </span>
        </div>

        {/* Modular Cause Fund Cards List */}
        <div className="space-y-4">
          {funds.map((fund) => (
            <CauseFundCard
              key={fund.id}
              fund={fund}
              onOffer={handleOffer}
            />
          ))}
        </div>
      </section>

      {!onOffer && (
        <OfferingModal
          selectedFundId={internalOfferingFundId}
          onClose={() => setInternalOfferingFundId(null)}
          onNavigateToLedger={onNavigateToLedger}
          onNavigateToPrayerWall={onNavigateToPrayerWall}
        />
      )}
    </div>
  );
};

export default SanctuaryHome;
