import React, { useState } from 'react';
import { Shield, Search, Clock, CheckCircle2, Heart } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';

export interface PersonalPurchasesProps {
  onViewProof?: (batchIdOrPackageId: string) => void;
}

export const PersonalPurchases: React.FC<PersonalPurchasesProps> = ({ onViewProof }) => {
  const { userPurchases, packages } = useMonasteryStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter purchases based on search query (by TX hash, package title, or dedication note)
  const filteredPurchases = userPurchases.filter((purchase) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      purchase.txHash.toLowerCase().includes(q) ||
      purchase.packageTitle.toLowerCase().includes(q) ||
      (purchase.dedicationNote && purchase.dedicationNote.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Header Banner */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Your Personal Giving Tracker
            </h2>
            <span className="text-[11px] bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>🔒 Private to You</span>
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            Personal ledger: Only shows charity packages you have purchased from this device.
          </p>
        </div>

        {/* Count Summary */}
        <div className="text-xs text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
          Sponsored:{' '}
          <strong className="text-amber-400 font-semibold">{userPurchases.length} Packages</strong>
        </div>
      </header>

      {/* Personal Lookup Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by your personal TX hash (e.g. 0x8a92...) or title..."
          className="w-full bg-stone-900/90 border border-stone-800 text-white placeholder-stone-500 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Purchases Feed */}
      {userPurchases.length === 0 ? (
        /* Empty State */
        <div className="bg-stone-900/50 border border-stone-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white">No Packages Sponsored Yet</h3>
          <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
            No packages sponsored yet in this session. Visit the Charity Packages tab to sponsor
            your first bundle.
          </p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-stone-900/50 border border-stone-800/80 rounded-2xl p-8 text-center text-stone-400 text-xs">
          No personal purchases matched "{searchQuery}".
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPurchases.map((purchase) => {
            const pkg = packages.find((p) => p.id === purchase.packageId);
            const isFulfilled = purchase.fulfillmentStatus === 'fulfilled_with_proof';

            return (
              <div
                key={purchase.id}
                className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4.5 flex flex-col gap-3 shadow-lg hover:border-stone-700 transition-all"
              >
                {/* Header: Title, Units, Amount & Fulfillment Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    {pkg?.coverImageUrl ? (
                      <img
                        src={pkg.coverImageUrl}
                        alt={purchase.packageTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-xl shrink-0">
                        📦
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {purchase.packageTitle} ({purchase.unitsBought} Package
                        {purchase.unitsBought > 1 ? 's' : ''})
                      </h3>
                      <div className="text-xs text-amber-400 font-semibold mt-0.5">
                        ${purchase.totalAmount} total • Purchased{' '}
                        {new Date(purchase.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment Status Badge */}
                  <div className="self-start sm:self-auto shrink-0">
                    {isFulfilled ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ Fulfilled &amp; Delivered with Photo Proof</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>⏳ Queued for Monk Trek</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Dedication Note */}
                {purchase.dedicationNote && (
                  <p className="text-xs text-stone-300 italic bg-stone-950/70 p-3 rounded-xl border border-stone-800/80 leading-relaxed">
                    <span className="text-amber-400/90 not-italic font-semibold block mb-0.5">
                      Your Dedication:
                    </span>
                    "{purchase.dedicationNote}"
                  </p>
                )}

                {/* On-Chain TX Hash and Action Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-stone-800/80 text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
                    <span>
                      Your TX: <strong className="text-sky-400 font-normal">{purchase.txHash}</strong>
                    </span>
                    <span className="text-stone-600">•</span>
                    <span>Block #{purchase.blockNumber}</span>
                  </div>

                  {isFulfilled ? (
                    <button
                      type="button"
                      onClick={() =>
                        onViewProof &&
                        onViewProof(purchase.linkedProofBatchId || purchase.packageId)
                      }
                      aria-label="View delivery photo proof"
                      className="inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-md self-start sm:self-auto"
                    >
                      <span>View Delivery Photo Proof ➔</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-stone-400 italic">
                      Monks will upload photo upon field delivery
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PersonalPurchases;
