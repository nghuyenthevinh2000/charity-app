import { PrayerIntention, CommunityComment, FundCategory } from '../types';

export function getFundName(fund: { id: string; name: string } | undefined, t: (key: string) => string): string {
  if (!fund) return '';
  const key = `funds.${fund.id}.name`;
  const translated = t(key);
  return translated && translated !== key ? translated : fund.name;
}

export function getFundDescription(fund: { id: string; description: string } | undefined, t: (key: string) => string): string {
  if (!fund) return '';
  const key = `funds.${fund.id}.description`;
  const translated = t(key);
  return translated && translated !== key ? translated : fund.description;
}

export function getFundCategory(category: FundCategory | string | undefined, t: (key: string) => string): string {
  if (!category) return '';
  const key = `categories.${category}`;
  const translated = t(key);
  return translated && translated !== key ? translated : category.replace('-', ' ');
}

export function getPrayerDedication(prayer: PrayerIntention | undefined, t: (key: string) => string): string {
  if (!prayer) return '';
  const key = `prayers.${prayer.id}.dedication`;
  const translated = t(key);
  return translated && translated !== key ? translated : prayer.dedicationText;
}

export function getCommentText(comment: CommunityComment | undefined): string {
  if (!comment) return '';
  return comment.commentText;
}
