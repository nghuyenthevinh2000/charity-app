import React, { useState, useRef, useEffect } from 'react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { CampaignProofCard } from './CampaignProofCard';
import { PersonalPurchases } from './PersonalPurchases';
import { Scroll, Sparkles, HeartHandshake } from 'lucide-react';

export type ProofSubTab = 'public' | 'personal';

export interface ProofExplorerProps {
  initialSubTab?: ProofSubTab;
  initialProofId?: string;
}

export const ProofExplorer: React.FC<ProofExplorerProps> = ({
  initialSubTab = 'public',
  initialProofId,
}) => {
  const { proofBatches, userPurchases } = useMonasteryStore();
  const [activeSubTab, setActiveSubTab] = useState<ProofSubTab>(initialSubTab);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleViewProof = (proofOrPackageId: string) => {
    setActiveSubTab('public');
    setTimeout(() => {
      const targetBatch = proofBatches.find(
        (b) => b.id === proofOrPackageId || b.packageId === proofOrPackageId
      );
      const elementId = targetBatch
        ? `proof-card-${targetBatch.id}`
        : `proof-card-${proofOrPackageId}`;
      const el =
        document.getElementById(elementId) ||
        document.querySelector(`[data-testid="${elementId}"]`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  useEffect(() => {
    if (initialProofId) {
      setActiveSubTab('public');
      handleViewProof(initialProofId);
    }
  }, [initialProofId]);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-2 sm:px-4 py-3">
      {/* SUB-NAVIGATION TOGGLE: PUBLIC CAMPAIGNS VS PRIVATE PERSONAL PURCHASES */}
      <nav
        aria-label="Proof Explorer navigation"
        role="tablist"
        className="flex items-center gap-1.5 p-1 bg-stone-900/90 border border-stone-800 rounded-2xl mb-4 shadow-md"
      >
        <button
          type="button"
          role="tab"
          id="tab-public-proofs"
          aria-selected={activeSubTab === 'public'}
          aria-controls="panel-public-proofs"
          onClick={() => setActiveSubTab('public')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'public'
              ? 'bg-stone-800 text-white shadow-md border border-stone-700'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-sm">📜</span>
          <span>Public Field Proofs</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
              activeSubTab === 'public'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            {proofBatches.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-personal-purchases"
          aria-selected={activeSubTab === 'personal'}
          aria-controls="panel-personal-purchases"
          onClick={() => setActiveSubTab('personal')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'personal'
              ? 'bg-stone-800 text-white shadow-md border border-stone-700'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
          }`}
        >
          <span className="text-sm">🌸</span>
          <span>My Purchased Packages</span>
          <span
            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
              activeSubTab === 'personal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            {userPurchases.length}
          </span>
        </button>
      </nav>

      {/* SUB-VIEW A: PUBLIC FIELD PROOFS (VERTICAL SNAP-SCROLL FEED) */}
      {activeSubTab === 'public' && (
        <section
          id="panel-public-proofs"
          role="tabpanel"
          aria-labelledby="tab-public-proofs"
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200">
                Verified Field Giving Proofs
              </h2>
              <p className="text-xs text-stone-500">
                Scroll up/down to browse. Tap details or comments to open drawers.
              </p>
            </div>
            <span className="text-[11px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
              ✓ {proofBatches.length} Monastic Missions
            </span>
          </div>

          {proofBatches.length === 0 ? (
            <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-12 text-center text-stone-400">
              <Scroll className="w-8 h-8 mx-auto mb-2 text-stone-500" />
              <p className="text-sm font-semibold">No Field Proof Batches Uploaded Yet</p>
              <p className="text-xs text-stone-500 mt-1">
                Monks are preparing relief journeys. Verified proofs will appear here upon delivery.
              </p>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="flex flex-col gap-6 snap-y snap-mandatory overflow-y-auto max-h-[calc(100vh-160px)] pr-1 scroll-smooth"
            >
              {proofBatches.map((proof, index) => (
                <CampaignProofCard key={proof.id} proof={proof} isFirst={index === 0} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SUB-VIEW B: PRIVATE PERSONAL PURCHASES (MY IMPACT) */}
      {activeSubTab === 'personal' && (
        <section
          id="panel-personal-purchases"
          role="tabpanel"
          aria-labelledby="tab-personal-purchases"
        >
          <PersonalPurchases onViewProof={handleViewProof} />
        </section>
      )}
    </div>
  );
};

export default ProofExplorer;
