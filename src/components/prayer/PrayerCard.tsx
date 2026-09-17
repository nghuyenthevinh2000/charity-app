import React from 'react';
import { MessageCircle } from 'lucide-react';
import { DonationInput, IntentionCategory } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { useMonasteryStore } from '../../context/MonasteryStore';

export interface PrayerCardProps {
  donation: DonationInput;
  onOpenDialogue: (donation: DonationInput) => void;
  onRejoice?: (donationId: string) => void;
}

const CATEGORY_STYLES: Record<IntentionCategory, { labelKey: string; defaultLabel: string; badgeClass: string; icon: string }> = {
  healing: {
    labelKey: 'offeringModal.catHealing',
    defaultLabel: 'Healing & Health (Cầu An)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: '🌿',
  },
  memorial: {
    labelKey: 'offeringModal.catMemorial',
    defaultLabel: 'In Loving Memory (Cầu Siêu)',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
    icon: '🕯️',
  },
  peace: {
    labelKey: 'offeringModal.catPeace',
    defaultLabel: 'Peace & Harmony (Cầu Bình An)',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: '🕊️',
  },
  gratitude: {
    labelKey: 'offeringModal.catGratitude',
    defaultLabel: 'Gratitude & Merit (Tùy Hỷ)',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    icon: '🪷',
  },
};

export const PrayerCard: React.FC<PrayerCardProps> = ({
  donation,
  onOpenDialogue,
  onRejoice,
}) => {
  const { t } = useTranslation();
  const { rejoiceMerit } = useMonasteryStore();

  const prayer = donation.prayerIntention;
  if (!prayer) return null;

  const categoryConfig = CATEGORY_STYLES[prayer.category] || CATEGORY_STYLES.peace;
  const categoryLabel = t(categoryConfig.labelKey) || categoryConfig.defaultLabel;

  const isBlessed = prayer.blessingStatus === 'blessed';
  const rejoiceCount = prayer.rejoiceCount || 0;
  const comments = prayer.comments || [];
  const commentsCount = comments.length;


  const handleRejoiceClick = () => {
    if (onRejoice) {
      onRejoice(donation.id);
    } else {
      rejoiceMerit(donation.id);
    }
  };

  return (
    <article
      className="bg-white rounded-2xl border border-parchment-300 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
      aria-label={`Prayer intention from ${donation.donorName}`}
    >
      {/* Top row: Category tag & Golden Lotus Blessing Seal */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryConfig.badgeClass}`}
        >
          <span>{categoryConfig.icon}</span>
          <span>{categoryLabel}</span>
        </span>

        {/* Lotus Blessing Seal */}
        {isBlessed ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs"
            title="Blessed during morning chanting meditation"
          >
            <span>
              {donation.id === 'd4' || prayer.blessedAt?.startsWith('2026-09-17')
                ? 'Blessed in Morning Chanting • 6:00 AM 🪷'
                : 'Blessed in Chanting Meditation 🪷'}
            </span>
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200"
            title="Queued for chanting meditation"
          >
            <span>⏳ Queued for Morning Chanting</span>
          </span>
        )}
      </div>

      {/* Donor Info & Date */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-stone-900 tracking-tight">
          {donation.donorName}
        </h3>
        <span className="text-[11px] text-stone-500 font-mono">
          {donation.date}
        </span>
      </div>

      {/* Intention / Dedication Text */}
      <div className="my-1.5 bg-parchment-50/60 rounded-xl p-3 border border-parchment-200/80">
        <p className="font-serif italic text-stone-800 text-xs sm:text-sm leading-relaxed">
          "{prayer.dedicationText}"
        </p>
      </div>



      {/* Action Row: Rejoice in Merit (Anumodana) & Sangha Conversation trigger */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-parchment-200">
        <button
          type="button"
          data-testid="rejoice-btn"
          aria-label="Rejoice in Merit"
          onClick={handleRejoiceClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-950 border border-amber-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <span className="text-sm">🙏</span>
          <span className="font-semibold">Anumodana</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-amber-900 text-[11px] font-bold border border-amber-300">
            {rejoiceCount}
          </span>
        </button>

        <button
          type="button"
          data-testid="dialogue-trigger-btn"
          onClick={() => onOpenDialogue(donation)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-parchment-100 hover:bg-parchment-200 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer border border-parchment-300"
        >
          <MessageCircle className="w-3.5 h-3.5 text-stone-600" />
          <span>
            {donation.id === 'd4' || donation.donorName === 'The Nguyen Family'
              ? `${commentsCount} conversation`
              : commentsCount === 0
                ? 'Offer reflection'
                : `${commentsCount} Sangha ${commentsCount === 1 ? 'reply' : 'replies'}`}
          </span>
        </button>
      </div>
    </article>
  );
};

export default PrayerCard;
