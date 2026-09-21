import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, HeartHandshake } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { CharityPackage } from '../../types';
import { PackageCard } from './PackageCard';
import { PackageBuyModal } from './PackageBuyModal';

export interface MarketplaceCarouselProps {
  onOpenProofExplorer?: (packageId?: string) => void;
}

export const MarketplaceCarousel: React.FC<MarketplaceCarouselProps> = ({
  onOpenProofExplorer,
}) => {
  const { packages } = useMonasteryStore();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedPackageForBuy, setSelectedPackageForBuy] = useState<CharityPackage | null>(null);

  // Swipe gesture detection state (tracking both X and Y to distinguish vertical vs horizontal scroll)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const totalPackages = packages.length;

  const handleNext = () => {
    if (totalPackages === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalPackages);
  };

  const handlePrev = () => {
    if (totalPackages === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalPackages) % totalPackages);
  };

  const handleGoTo = (index: number) => {
    if (index >= 0 && index < totalPackages) {
      setCurrentIndex(index);
    }
  };

  // Touch Handlers with 50px delta threshold and horizontal dominance check
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches?.[0] ?? e.changedTouches?.[0];
    const clientX = touch?.clientX ?? (e as unknown as MouseEvent).clientX;
    const clientY = touch?.clientY ?? (e as unknown as MouseEvent).clientY;

    if (typeof clientX === 'number') {
      touchStartXRef.current = clientX;
    }
    if (typeof clientY === 'number') {
      touchStartYRef.current = clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const touch = e.changedTouches?.[0] ?? e.touches?.[0];
    const clientX = touch?.clientX ?? (e as unknown as MouseEvent).clientX;
    const clientY = touch?.clientY ?? (e as unknown as MouseEvent).clientY;

    if (typeof clientX === 'number') {
      const deltaX = clientX - touchStartXRef.current;
      const deltaY =
        typeof clientY === 'number' && touchStartYRef.current !== null
          ? clientY - touchStartYRef.current
          : 0;
      const SWIPE_THRESHOLD = 50;

      // Distinguish horizontal swipe vs vertical scroll
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < -SWIPE_THRESHOLD) {
          // Swiped left -> navigate next
          handleNext();
        } else if (deltaX > SWIPE_THRESHOLD) {
          // Swiped right -> navigate prev
          handlePrev();
        }
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  if (totalPackages === 0) {
    return (
      <div className="p-8 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200 m-4">
        <HeartHandshake className="w-12 h-12 text-stone-400 mx-auto" />
        <h3 className="font-serif text-lg font-bold text-stone-700">
          No Charity Packages Available
        </h3>
        <p className="text-xs text-stone-500">
          Monks are currently preparing the next cycle of relief supplies.
        </p>
      </div>
    );
  }

  // Ensure index is valid within range
  const safeIndex = Math.min(Math.max(0, currentIndex), totalPackages - 1);
  const currentPackage = packages[safeIndex];

  return (
    <div
      className="p-3 sm:p-5 max-w-lg mx-auto flex flex-col space-y-4 focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Charity Packages Marketplace"
    >
      {/* Top Carousel Navigation Banner */}
      <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Charity Packages Marketplace</span>
        </div>
        <div
          className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60"
          aria-live="polite"
        >
          Package {safeIndex + 1} of {totalPackages}
        </div>
      </div>

      {/* Swipeable Single-Card Viewport Frame */}
      <div
        className="swipe-container relative select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Exactly ONE package card rendered on screen */}
        <PackageCard
          key={currentPackage.id}
          packageData={currentPackage}
          onOpenBuy={(pkg) => setSelectedPackageForBuy(pkg)}
        />
      </div>

      {/* Carousel Navigation Arrows & Dot Indicators */}
      <div className="flex items-center justify-between px-2 pt-1">
        {/* Left / Previous Chevron Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous package"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-stone-100 active:bg-stone-200 border border-stone-300 shadow-xs flex items-center justify-center text-stone-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Package selector">
          {packages.map((pkg, idx) => {
            const isActive = idx === safeIndex;
            return (
              <button
                key={pkg.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to package ${idx + 1}: ${pkg.title}`}
                onClick={() => handleGoTo(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'w-7 bg-amber-500 shadow-xs ring-1 ring-amber-400'
                    : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            );
          })}
        </div>

        {/* Right / Next Chevron Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next package"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-stone-100 active:bg-stone-200 border border-stone-300 shadow-xs flex items-center justify-center text-stone-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Package Purchase Modal */}
      <PackageBuyModal
        pkg={selectedPackageForBuy}
        isOpen={Boolean(selectedPackageForBuy)}
        onClose={() => setSelectedPackageForBuy(null)}
        onViewInExplorer={(purchase) => {
          setSelectedPackageForBuy(null);
          if (onOpenProofExplorer) {
            onOpenProofExplorer(purchase.packageId);
          }
        }}
        onSuccess={(purchase) => {
          setSelectedPackageForBuy(null);
          if (onOpenProofExplorer) {
            onOpenProofExplorer(purchase.packageId);
          }
        }}
      />
    </div>
  );
};

export default MarketplaceCarousel;
