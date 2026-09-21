import React, { useState, useRef, useEffect } from 'react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { CampaignProofCard } from './CampaignProofCard';
import { PersonalPurchases } from './PersonalPurchases';
import { Scroll, ChevronUp, ChevronDown } from 'lucide-react';

export type ProofSubTab = 'public' | 'personal';

export interface ProofExplorerProps {
  initialSubTab?: ProofSubTab;
  initialProofId?: string;
}

export const ProofExplorer: React.FC<ProofExplorerProps> = ({
  initialSubTab = 'public',
  initialProofId,
}) => {
  const { proofBatches } = useMonasteryStore();
  const [activeSubTab, setActiveSubTab] = useState<ProofSubTab>(initialSubTab);
  const [activeProofIndex, setActiveProofIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isWheelThrottled = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const safeIndex =
    proofBatches.length > 0
      ? Math.min(Math.max(activeProofIndex, 0), proofBatches.length - 1)
      : 0;

  const currentProof = proofBatches[safeIndex];

  const handlePrevProof = () => {
    setActiveProofIndex((prev) => (prev > 0 ? prev - 1 : proofBatches.length - 1));
  };

  const handleNextProof = () => {
    setActiveProofIndex((prev) => (prev < proofBatches.length - 1 ? prev + 1 : 0));
  };

  const handleGoToProof = (idx: number) => {
    setActiveProofIndex(idx);
  };

  const handleViewProof = (proofOrPackageId: string) => {
    setActiveSubTab('public');
    const targetIdx = proofBatches.findIndex(
      (b) => b.id === proofOrPackageId || b.packageId === proofOrPackageId
    );
    if (targetIdx !== -1) {
      setActiveProofIndex(targetIdx);
    }
  };

  useEffect(() => {
    if (initialProofId) {
      handleViewProof(initialProofId);
    }
  }, [initialProofId, proofBatches]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      handlePrevProof();
    } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      handleNextProof();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isWheelThrottled.current) return;
    if (Math.abs(e.deltaY) > 30) {
      isWheelThrottled.current = true;
      if (e.deltaY > 0) {
        handleNextProof();
      } else {
        handlePrevProof();
      }
      setTimeout(() => {
        isWheelThrottled.current = false;
      }, 400);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null || touchStartXRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    // Predominantly vertical swipe with threshold of 45px
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 45) {
      if (deltaY < 0) {
        handleNextProof(); // Swipe up -> next campaign
      } else {
        handlePrevProof(); // Swipe down -> previous campaign
      }
    }
    touchStartYRef.current = null;
    touchStartXRef.current = null;
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-2 sm:px-4 py-2">
      {/* SUB-VIEW A: PUBLIC FIELD PROOFS (CLEAN SINGLE-CAMPAIGN VIEWPORT SWITCHING) */}
      {activeSubTab === 'public' && (
        <section
          id="panel-public-proofs"
          role="tabpanel"
          aria-label="Public Field Proofs"
          className="flex flex-col gap-2.5"
        >
          {proofBatches.length === 0 ? (
            <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-12 text-center text-stone-400">
              <Scroll className="w-8 h-8 mx-auto mb-2 text-stone-500" />
              <p className="text-sm font-semibold">No Field Proof Batches Uploaded Yet</p>
              <p className="text-xs text-stone-500 mt-1">
                Monks are preparing relief journeys. Verified proofs will appear here upon delivery.
              </p>
            </div>
          ) : (
            <>
              {/* Clean Switcher Header Controls */}
              <div className="flex items-center justify-between bg-stone-900/90 border border-stone-800 rounded-2xl px-3.5 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📜</span>
                  <span className="text-xs font-bold text-stone-200">
                    Mission {safeIndex + 1} of {proofBatches.length}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                    ✓ {currentProof.unitsDistributed} Given
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevProof}
                    aria-label="Previous campaign"
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700/60"
                    title="Previous Campaign (Up)"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextProof}
                    aria-label="Next campaign"
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer border border-stone-700/60"
                    title="Next Campaign (Down)"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Clean Single Active Card (No free scroll overlap) */}
              <div
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full focus:outline-none transition-all duration-300"
              >
                <CampaignProofCard
                  key={currentProof.id}
                  proof={currentProof}
                  isFirst={safeIndex === 0}
                />
              </div>

              {/* Campaign Indicator Dots */}
              <div
                className="flex items-center gap-1.5 justify-center pt-1"
                role="tablist"
                aria-label="Campaign selector"
              >
                {proofBatches.map((batch, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={batch.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Go to mission ${idx + 1}: ${batch.packageTitle}`}
                      onClick={() => handleGoToProof(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'w-7 bg-emerald-500 shadow-xs'
                          : 'w-2 bg-stone-700 hover:bg-stone-500'
                      }`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* SUB-VIEW B: PRIVATE PERSONAL PURCHASES (MY IMPACT) - Preserved for future usage */}
      {activeSubTab === 'personal' && (
        <section
          id="panel-personal-purchases"
          role="tabpanel"
          aria-label="My Purchased Packages"
        >
          <PersonalPurchases onViewProof={handleViewProof} />
        </section>
      )}
    </div>
  );
};

export default ProofExplorer;
