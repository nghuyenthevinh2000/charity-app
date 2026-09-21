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
              {/* Clean Single Active Card (No free scroll overlap) */}
              <div
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="relative w-full focus:outline-none transition-all duration-300"
              >
                <CampaignProofCard
                  key={currentProof.id}
                  proof={currentProof}
                  isFirst={safeIndex === 0}
                />
              </div>

              {/* Bottom Navigation Controls (Pure Navigation Only, No Text) */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevProof}
                  aria-label="Previous campaign"
                  className="p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition-all cursor-pointer border border-stone-800 shadow-sm active:scale-95"
                  title="Previous Campaign"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Campaign Indicator Dots */}
                <div
                  className="flex items-center gap-1.5"
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

                <button
                  type="button"
                  onClick={handleNextProof}
                  aria-label="Next campaign"
                  className="p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition-all cursor-pointer border border-stone-800 shadow-sm active:scale-95"
                  title="Next Campaign"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
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
