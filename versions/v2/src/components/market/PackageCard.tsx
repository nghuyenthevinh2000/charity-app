import React, { useState } from 'react';
import { CheckCircle2, Package, ShieldCheck, Heart } from 'lucide-react';
import { CharityPackage } from '../../types';
import { calculateProgress } from '../../utils/crypto';

export interface PackageCardProps {
  packageData: CharityPackage;
  onOpenBuy: (pkg: CharityPackage) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  winter: '🌾 Winter & Food Relief',
  food: '🍲 Food & Nourishment',
  education: '📖 Education & Children',
  medical: '🌱 Healthcare & Medicine',
  emergency: '💧 Emergency & Water',
};

export const PackageCard: React.FC<PackageCardProps> = ({ packageData, onOpenBuy }) => {
  const [imageError, setImageError] = useState(false);

  const funded = calculateProgress(packageData.fundedUnits, packageData.targetUnits);
  const distributed = calculateProgress(packageData.distributedUnits, packageData.targetUnits);

  const categoryText =
    CATEGORY_LABELS[packageData.category] ||
    `${packageData.category.charAt(0).toUpperCase() + packageData.category.slice(1)} Relief`;

  // Calculate the queued percentage (funded but not yet distributed)
  const queuedPercent = Math.max(0, funded.percent - distributed.percent);

  return (
    <article
      className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-lg overflow-hidden flex flex-col transition-all"
      aria-label={packageData.title}
    >
      {/* Card Banner / Cover Image */}
      <div className="relative h-56 sm:h-64 w-full bg-stone-900 overflow-hidden">
        {!imageError && packageData.coverImageUrl ? (
          <img
            src={packageData.coverImageUrl}
            alt={packageData.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover brightness-90 hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${
              packageData.bannerGradient || 'from-amber-700 via-orange-600 to-amber-900'
            } flex items-center justify-center`}
          >
            <Package className="w-16 h-16 text-white/40" />
          </div>
        )}

        {/* Subtle Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top-Right Price Badge */}
        <div className="absolute top-3.5 right-3.5 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-400/40 text-amber-300 font-bold text-sm sm:text-base shadow-md flex items-center gap-1">
          <span>${packageData.unitPrice}</span>
          <span className="text-xs font-normal text-amber-100/80">/ package</span>
        </div>

        {/* Top-Left Category Badge */}
        <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-medium text-stone-100 shadow-sm">
          {categoryText}
        </div>

        {/* Bottom Banner Title Overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-[11px] font-medium tracking-wide uppercase text-amber-300 flex items-center gap-1 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Curated by {packageData.createdByMonk || 'Monastery Stewards'}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug drop-shadow-md">
            {packageData.title}
          </h2>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {packageData.description}
        </p>

        {/* Items Included Breakdown */}
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-700 block">
            Included in this package:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {packageData.itemsIncluded.map((item, idx) => (
              <span
                key={idx}
                className="bg-stone-100 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Dual Progress Bars: Funded vs Distributed with Photo Proof */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:p-3.5 space-y-2">
          {/* Progress Header Numbers */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-stone-700">
              Funded:{' '}
              <strong className="text-stone-900 font-bold">
                {packageData.fundedUnits} of {packageData.targetUnits}
              </strong>{' '}
              kits ({funded.percent}%)
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              {packageData.distributedUnits} Kits Distributed ✓
            </span>
          </div>

          {/* Progress Bar Track */}
          <div
            className="h-3 w-full bg-stone-200 rounded-full overflow-hidden flex shadow-inner"
            role="progressbar"
            aria-valuenow={funded.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Funding and distribution progress"
          >
            {/* Distributed portion (Emerald Green with proof) */}
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${distributed.percent}%` }}
              title={`${packageData.distributedUnits} kits distributed with on-chain photo proof`}
            />
            {/* Queued funded portion (Saffron/Amber awaiting distribution) */}
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${queuedPercent}%` }}
              title={`${packageData.fundedUnits - packageData.distributedUnits} kits funded and queued for delivery`}
            />
          </div>

          {/* Progress Legend */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 pt-0.5">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Green = Distributed with photo proof
            </span>
            <span className="flex items-center gap-1 text-amber-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Amber = Funded &amp; queued
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onOpenBuy(packageData)}
            aria-label={`Sponsor this package: ${packageData.title}`}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 active:scale-[0.99] text-white font-serif font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <Heart className="w-4 h-4 fill-white/20" />
            <span>Sponsor This Package (${packageData.unitPrice})</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default PackageCard;
