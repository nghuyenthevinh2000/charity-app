import React, { useState } from 'react';
import { Shield, Search, Clock, CheckCircle2, Heart, Copy, Check } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';

export interface PersonalPurchasesProps {
  onViewProof?: (batchIdOrPackageId: string) => void;
}

export const PersonalPurchases: React.FC<PersonalPurchasesProps> = ({ onViewProof }) => {
  const { userPurchases, packages } = useMonasteryStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const handleCopyHash = async (id: string, hash: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(hash);
      }
      setCopiedTxId(id);
      setTimeout(() => setCopiedTxId(null), 2000);
    } catch {
      setCopiedTxId(id);
      setTimeout(() => setCopiedTxId(null), 2000);
    }
  };

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
    <div className="flex flex-col gap-3.5 py-1">
      {/* Section Header: Title, Private Badge & Count */}
      <div className="flex items-center justify-between gap-2 px-0.5 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">
            Your Personal Giving Tracker
          </h2>
          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-500" />
            <span>🔒 Private to You</span>
          </span>
        </div>

        <div className="text-[11px] text-stone-500 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
          Sponsored: <strong className="text-amber-700 font-semibold">{userPurchases.length} Packages</strong>
        </div>
      </div>

      {/* Personal Lookup Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by your personal TX hash (e.g. 0x8a92...) or title..."
          className="w-full bg-white border border-stone-200 text-stone-800 placeholder-stone-400 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Purchases Feed */}
      {userPurchases.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-stone-200 rounded-2xl p-7 text-center flex flex-col items-center justify-center gap-2.5 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">No Packages Sponsored Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
            No packages sponsored yet in this session. Visit the Charity Packages tab to sponsor
            your first bundle.
          </p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-500 text-xs shadow-2xs">
          No personal purchases matched "{searchQuery}".
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPurchases.map((purchase) => {
            const pkg = packages.find((p) => p.id === purchase.packageId);
            const isFulfilled = purchase.fulfillmentStatus === 'fulfilled_with_proof';

            return (
              <div
                key={purchase.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:border-stone-300 transition-all"
              >
                {/* Card Header: Title, Units, Amount & Fulfillment Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    {pkg?.coverImageUrl ? (
                      <img
                        src={pkg.coverImageUrl}
                        alt={purchase.packageTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                        📦
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 leading-snug">
                        {purchase.packageTitle} ({purchase.unitsBought} Package
                        {purchase.unitsBought > 1 ? 's' : ''})
                      </h3>
                      <div className="text-xs text-amber-700 font-semibold mt-0.5">
                        ${purchase.totalAmount} total • Purchased{' '}
                        {new Date(purchase.timestamp).toLocaleDateString()}
                      </div>
                      {pkg?.itemsIncluded && pkg.itemsIncluded.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {pkg.itemsIncluded.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fulfillment Status Badge */}
                  <div className="self-start sm:self-auto shrink-0">
                    {isFulfilled ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Fulfilled &amp; Delivered with Photo Proof</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>⏳ Queued for Monk Trek</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Dedication Note */}
                {purchase.dedicationNote && (
                  <p className="text-xs text-stone-700 italic bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/50 leading-relaxed">
                    <span className="text-amber-800 not-italic font-semibold block mb-0.5">
                      Your Dedication:
                    </span>
                    "{purchase.dedicationNote}"
                  </p>
                )}

                {/* On-Chain TX Hash and Action Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-stone-500 flex-wrap">
                    <span>
                      Your TX:{' '}
                      <strong className="text-stone-800 font-normal">
                        {purchase.txHash.length > 18
                          ? `${purchase.txHash.slice(0, 10)}...${purchase.txHash.slice(-6)}`
                          : purchase.txHash}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(purchase.id, purchase.txHash)}
                      aria-label={copiedTxId === purchase.id ? t('common.copied') : t('common.copyHash')}
                      className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer border border-stone-200 active:scale-95"
                      title={purchase.txHash}
                    >
                      {copiedTxId === purchase.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">{t('common.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-stone-500" />
                          <span>{t('common.copy')}</span>
                        </>
                      )}
                    </button>
                    <span className="text-stone-300">•</span>
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
