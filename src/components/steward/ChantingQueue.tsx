import React, { useState } from 'react';
import { Sparkles, Check, Flower2 } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { IntentionCategory } from '../../types';

export interface ChantingQueueProps {
  onBlessed?: (donationId: string) => void;
}

const CATEGORY_STYLES: Record<IntentionCategory, { bg: string; text: string; labelEn: string; labelVi: string }> = {
  healing: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    labelEn: 'Healing & Health (Cầu An)',
    labelVi: 'Cầu An & Sức Khỏe',
  },
  memorial: {
    bg: 'bg-stone-100 border-stone-300',
    text: 'text-stone-800',
    labelEn: 'In Loving Memory (Cầu Siêu)',
    labelVi: 'Cầu Siêu Liệt Vị',
  },
  peace: {
    bg: 'bg-sky-50 border-sky-200',
    text: 'text-sky-800',
    labelEn: 'Peace & Harmony (Cầu Bình An)',
    labelVi: 'Cầu Bình An & Hòa Hợp',
  },
  gratitude: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    labelEn: 'Gratitude & Merit (Tùy Hỷ)',
    labelVi: 'Tùy Hỷ Công Đức',
  },
};

export const ChantingQueue: React.FC<ChantingQueueProps> = ({ onBlessed }) => {
  const { donations, blessPrayerIntention } = useMonasteryStore();
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<'queued' | 'all'>('queued');
  const [justBlessedIds, setJustBlessedIds] = useState<string[]>([]);

  // Extract donations with prayer intentions
  const prayerDonations = donations.filter((d) => d.prayerIntention);

  const queuedDonations = prayerDonations.filter(
    (d) => d.prayerIntention?.blessingStatus === 'queued' || justBlessedIds.includes(d.id)
  );

  const displayedDonations = filter === 'queued' ? queuedDonations : prayerDonations;

  const handleBless = (donationId: string) => {
    setJustBlessedIds((prev) => [...prev, donationId]);
    blessPrayerIntention(donationId);
    if (onBlessed) onBlessed(donationId);
  };

  return (
    <section className="space-y-3" aria-label={t('steward.chantingQueue') || 'Morning Chanting Queue'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flower2 className="w-4 h-4 text-saffron-600" />
          <h3 className="text-sm font-serif font-bold text-stone-900">
            {t('steward.chantingQueue') || 'Morning Chanting & Prayer Intentions'}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilter('queued')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              filter === 'queued'
                ? 'bg-amber-100 text-saffron-800 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'vi' ? 'Chờ Chú Nguyện' : 'Pending Queue'} ({queuedDonations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-100 text-saffron-800 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'vi' ? 'Tất Cả' : 'All'} ({prayerDonations.length})
          </button>
        </div>
      </div>

      {displayedDonations.length === 0 ? (
        <div className="p-6 rounded-2xl bg-parchment-50 border border-parchment-200 text-center space-y-1.5">
          <Sparkles className="w-6 h-6 text-saffron-600/70 mx-auto" />
          <p className="text-xs font-medium text-stone-700">
            {language === 'vi'
              ? 'Tất cả tâm nguyện đã được chú nguyện viên mãn!'
              : 'All prayer intentions have been recited and blessed!'}
          </p>
          <p className="text-[11px] text-stone-500">
            {language === 'vi'
              ? 'Nguyện công đức hồi hướng khắp muôn loài an lạc.'
              : 'May the boundless merit bring peace to all beings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedDonations.map((donation) => {
            const intention = donation.prayerIntention!;
            const categoryConfig =
              CATEGORY_STYLES[intention.category] || CATEGORY_STYLES.peace;
            const isQueued = intention.blessingStatus === 'queued';

            return (
              <div
                key={donation.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isQueued
                    ? 'bg-white border-amber-200/90 shadow-2xs hover:border-amber-300'
                    : 'bg-parchment-50/80 border-stone-200 text-stone-700'
                }`}
              >
                {/* Card Top: Donor, Date, Category */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="font-serif font-bold text-stone-900 text-xs sm:text-sm block truncate">
                      {donation.donorName}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      ${donation.amount} • {donation.date}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${categoryConfig.bg} ${categoryConfig.text}`}
                  >
                    {language === 'vi' ? categoryConfig.labelVi : categoryConfig.labelEn}
                  </span>
                </div>

                {/* Dedication Text */}
                <p className="text-xs font-serif italic text-stone-800 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 mb-3 leading-relaxed">
                  "{intention.dedicationText}"
                </p>

                {/* Action / Status Row */}
                <div className="flex items-center justify-between pt-1">
                  {isQueued ? (
                    <button
                      type="button"
                      onClick={() => handleBless(donation.id)}
                      className="w-full py-2 px-3 rounded-xl bg-saffron-600 hover:bg-saffron-700 active:scale-[0.98] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      aria-label="Recite & Bless 🪷"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('steward.reciteAndBless') || 'Recite & Bless 🪷'}</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('steward.blessedSuccess') || 'Blessed'} • Morning Chanting</span>
                      </span>
                      <span className="text-[10px] text-emerald-700/80">6:00 AM 🪷</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ChantingQueue;
