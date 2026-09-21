import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { DonationInput } from '../../types';
import { PrayerCard } from '../prayer/PrayerCard';
import { PrayerDialogueDrawer } from '../prayer/PrayerDialogueDrawer';

export type PrayerFilter = 'all' | 'healing' | 'memorial' | 'peace' | 'my';

export const PrayerWall: React.FC = () => {
  const { t } = useTranslation();
  const { donations, rejoiceMerit } = useMonasteryStore();

  const [activeFilter, setActiveFilter] = useState<PrayerFilter>('all');
  const [activeDialogueDonationId, setActiveDialogueDonationId] = useState<string | null>(null);

  const filterOptions: { id: PrayerFilter; label: string }[] = [
    { id: 'all', label: t('prayerWall.filterAll') || 'All' },
    { id: 'healing', label: t('prayerWall.filterHealing') || 'Healing & Health' },
    { id: 'memorial', label: t('prayerWall.filterMemorial') || 'In Loving Memory' },
    { id: 'peace', label: t('prayerWall.filterPeace') || 'Peace & Family' },
    { id: 'my', label: t('prayerWall.filterMy') || 'My Prayers' },
  ];

  // Retrieve user's dedicated prayer IDs from localStorage if available
  const getMyPrayerIds = (): string[] => {
    try {
      const stored = localStorage.getItem('lotus_my_prayers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const myPrayerIds = getMyPrayerIds();

  // Filter donations that contain prayer intentions
  const prayerDonations = donations.filter((d) => {
    if (!d.prayerIntention) return false;

    // "My Prayers" filter
    if (activeFilter === 'my') {
      if (myPrayerIds.length > 0) {
        return myPrayerIds.includes(d.id) || myPrayerIds.includes(d.txHash);
      }
      // If no stored ID, show donations not in the original seed or match user
      return d.id.startsWith('d') && d.id.length > 5;
    }

    // Must be public unless "my"
    if (d.prayerIntention.isPublic === false) return false;

    if (activeFilter === 'all') return true;
    return d.prayerIntention.category === activeFilter;
  });

  const activeDialogueDonation = activeDialogueDonationId
    ? donations.find((d) => d.id === activeDialogueDonationId) || null
    : null;

  const handleOpenDialogue = (donation: DonationInput) => {
    setActiveDialogueDonationId(donation.id);
  };

  const handleCloseDialogue = () => {
    setActiveDialogueDonationId(null);
  };

  return (
    <section className="p-4 space-y-4" aria-label="Prayer Wall">
      {/* Header */}
      <div className="border-b border-parchment-300 pb-3">
        <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
          <span>{t('prayerWall.title') || 'Book of Intentions & Sangha'}</span>
          <span className="text-base">🪷</span>
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          {t('prayerWall.subtitle') || 'Monks and devotees conversing in compassion and mindfulness'}
        </p>
      </div>

      {/* Filter Chips / Pills */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
        role="tablist"
        aria-label="Filter prayers by category"
      >
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="button"
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-parchment-300 hover:bg-parchment-100'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* List of Prayer Cards */}
      <div className="space-y-3">
        {prayerDonations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-parchment-300 p-6 space-y-2">
            <span className="text-3xl">🕊️</span>
            <h3 className="text-sm font-serif font-semibold text-stone-800">
              {t('prayerWall.emptyTitle')}
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {activeFilter === 'my'
                ? t('prayerWall.emptyMy')
                : t('prayerWall.emptyGeneral')}
            </p>
          </div>
        ) : (
          prayerDonations.map((donation) => (
            <PrayerCard
              key={donation.id}
              donation={donation}
              onOpenDialogue={handleOpenDialogue}
              onRejoice={rejoiceMerit}
            />
          ))
        )}
      </div>

      {/* Sangha Community Dialogue Bottom Sheet Drawer */}
      <PrayerDialogueDrawer
        isOpen={Boolean(activeDialogueDonation)}
        onClose={handleCloseDialogue}
        donation={activeDialogueDonation}
      />
    </section>
  );
};

export default PrayerWall;
