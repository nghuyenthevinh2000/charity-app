import React from 'react';
import {
  Utensils,
  HeartPulse,
  Zap,
  BookOpen,
  Heart,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';
import { Fund } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface CauseFundCardProps {
  fund: Fund;
  onOffer?: (fundId: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  bowl: Utensils,
  food: Utensils,
  heartpulse: HeartPulse,
  health: HeartPulse,
  medicine: HeartPulse,
  zap: Zap,
  utilities: Zap,
  energy: Zap,
  bookopen: BookOpen,
  book: BookOpen,
  education: BookOpen,
  dharma: BookOpen,
  heart: Heart,
  sparkles: Sparkles,
};

function getFundIcon(iconName: string): LucideIcon {
  const normalized = iconName.toLowerCase().replace(/[^a-z]/g, '');
  return iconMap[normalized] || Heart;
}

function formatDeadlineDate(deadline: string, language: string): string {
  if (!deadline) return '';
  try {
    const parsed = new Date(deadline.includes('T') ? deadline : `${deadline}T00:00:00`);
    if (isNaN(parsed.getTime())) return deadline;
    return parsed.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return deadline;
  }
}

export const CauseFundCard: React.FC<CauseFundCardProps> = ({ fund, onOffer }) => {
  const { t, language } = useTranslation();

  const IconComponent = getFundIcon(fund.icon);

  // Percentage fulfilled: use Math.floor to match integer spec/expectations (e.g. 1240/1500 = 82%)
  const percentage =
    fund.targetAmount > 0
      ? Math.min(100, Math.floor((fund.currentBalance / fund.targetAmount) * 100))
      : 0;

  // Days remaining calculation
  let days = fund.daysRemaining;
  if (days === undefined && fund.deadline) {
    const targetMs = new Date(fund.deadline.includes('T') ? fund.deadline : `${fund.deadline}T00:00:00`).getTime();
    if (!isNaN(targetMs)) {
      days = Math.max(0, Math.ceil((targetMs - Date.now()) / (1000 * 60 * 60 * 24)));
    } else {
      days = 0;
    }
  }

  const formattedDate = formatDeadlineDate(fund.deadline, language);
  const deadlineText =
    fund.deadline && formattedDate
      ? t('sanctuary.daysRemaining', { days: days ?? 0, date: formattedDate })
      : t('sanctuary.remaining', { days: days ?? 0 });

  const formattedCurrent = `$${fund.currentBalance.toLocaleString()}`;
  const formattedTarget = `$${fund.targetAmount.toLocaleString()}`;

  const isVerified = fund.verifiedStatus?.isVerified;
  const verifiedBadgeLabel =
    fund.verifiedStatus?.badgeLabel || t('sanctuary.verifiedBy') || 'Verified by Abbot ✓';

  return (
    <article
      className="bg-white rounded-2xl p-4 sm:p-5 border border-parchment-300 shadow-xs space-y-3.5 transition-all hover:shadow-sm"
      aria-label={fund.name}
    >
      {/* Header: Icon, Title & Verified Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            style={{
              backgroundColor: fund.color ? `${fund.color}15` : '#D9770615',
              color: fund.color || '#D97706',
            }}
          >
            <IconComponent className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
              {fund.name}
            </h3>
            {fund.category && (
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                {fund.category.replace('-', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Jade Green Verified Status Badge */}
        {isVerified && (
          <span
            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
            title={verifiedBadgeLabel}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
            <span>{verifiedBadgeLabel}</span>
          </span>
        )}
      </div>

      {/* Cause Description */}
      <p className="text-xs text-stone-600 leading-relaxed">
        {fund.description}
      </p>

      {/* Fulfillment Progress Bar & Numbers */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-medium text-stone-800">
          <span>
            {t('sanctuary.raisedOf', {
              current: formattedCurrent,
              target: formattedTarget,
              pct: percentage.toString(),
            })}
          </span>
          <span className="text-stone-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            {t('sanctuary.supporters', { count: fund.supportersCount })}
          </span>
        </div>

        {/* Dedicated Fulfillment Progress Bar */}
        <div
          className="h-2.5 rounded-full bg-parchment-300 w-full overflow-hidden"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-saffron-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Time Deadline Tracker Pill */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>{deadlineText}</span>
        </span>
      </div>

      {/* Dedicated Amber "Offer to this Cause" Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onOffer?.(fund.id)}
          className="w-full py-3 px-4 bg-saffron-600 hover:bg-saffron-700 active:bg-saffron-800 text-white rounded-xl font-medium text-sm transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-1"
        >
          <span>{t('sanctuary.offerButton')}</span>
        </button>
      </div>
    </article>
  );
};

export default CauseFundCard;
