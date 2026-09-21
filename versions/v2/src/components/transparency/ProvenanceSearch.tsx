import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Landmark,
  ArrowUpRight,
  Receipt,
  HelpCircle,
  X,
  History,
} from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { calculateProvenance } from '../../utils/utxo';
import { ProvenanceResult, SpentOutput } from '../../types';

export interface ProvenanceSearchProps {
  initialTxHash?: string | null;
  onInspectReceipt?: (spentOutput: SpentOutput) => void;
}

const SAMPLE_HASHES = [
  { label: 'Devotee Ananda ($50)', hash: '0x8e2a149f' },
  { label: 'Devotee Linh Nguyen ($40)', hash: '0x3c1b8201' },
  { label: 'Devotee Tran Van Duc ($100)', hash: '0x5d9e4412' },
];

export const ProvenanceSearch: React.FC<ProvenanceSearchProps> = ({
  initialTxHash,
  onInspectReceipt,
}) => {
  const { transactions, donations } = useMonasteryStore();
  const { t, language } = useTranslation();

  const [query, setQuery] = useState<string>('');
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [result, setResult] = useState<ProvenanceResult | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const runSearch = (hashToSearch: string) => {
    const trimmed = hashToSearch.trim();
    if (!trimmed) {
      setResult(null);
      setHasSearched(false);
      setSearchedQuery('');
      return;
    }

    setSearchedQuery(trimmed);
    setHasSearched(true);
    const provResult = calculateProvenance(trimmed, transactions, donations);
    setResult(provResult);
  };

  useEffect(() => {
    if (initialTxHash && initialTxHash.trim()) {
      setQuery(initialTxHash.trim());
      runSearch(initialTxHash.trim());
    }
  }, [initialTxHash, transactions, donations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleSelectSample = (hash: string) => {
    setQuery(hash);
    runSearch(hash);
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setHasSearched(false);
    setSearchedQuery('');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-4">
      {/* Title & Subtitle */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-saffron-600" />
            <span>{t('transparency.traceTitle') || 'My Offering Provenance Tracker'}</span>
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            {language === 'vi'
              ? 'Nhập mã giao dịch cúng dường để kiểm tra tỷ lệ giải ngân và tiền lưu trữ'
              : 'Enter your donation TX Hash to trace verified spending and treasury reserves'}
          </p>
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              t('transparency.tracePlaceholder') ||
              'Search by your donation TX Hash (e.g. 0x8e2...)'
            }
            className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Quick sample chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar text-[11px] text-stone-500">
            <span className="shrink-0 text-stone-400 flex items-center gap-0.5">
              <History className="w-3 h-3" />
              <span>{t('transparency.sampleLabel')}</span>
            </span>
            {SAMPLE_HASHES.map((sample) => (
              <button
                key={sample.hash}
                type="button"
                onClick={() => handleSelectSample(sample.hash)}
                className="shrink-0 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 px-2 py-0.5 rounded-full font-mono text-[10px] transition-colors cursor-pointer border border-stone-200"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="shrink-0 py-2 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>{t('transparency.traceButton') || 'Trace My Offering'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Results Display */}
      {hasSearched && (
        <div className="pt-2 border-t border-stone-100">
          {result && result.found && result.donation ? (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Devotee Offering Banner */}
              <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/50 rounded-xl p-3 border border-amber-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800">
                    {t('transparency.verifiedOffering')}
                  </span>
                  <div className="text-sm font-bold text-stone-900">
                    {result.donation.donorName}
                  </div>
                  <div className="font-mono text-[10px] text-stone-500">
                    TX: {result.donation.txHash} • {result.donation.date}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">
                    {t('transparency.totalOffered')}
                  </span>
                  <span className="text-lg font-serif font-bold text-saffron-700">
                    ${result.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Provenance Stat Cards */}
              <div className="grid grid-cols-2 gap-2">
                {/* Verified Spent */}
                <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-200">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('transparency.spentTitle') || 'Verified Spent'}</span>
                  </div>
                  <div className="text-lg font-serif font-bold text-emerald-900 mt-1">
                    ${result.spentAmount.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                    {t('transparency.ofGift', { pct: result.spentPercentage })}
                  </div>
                </div>

                {/* Retained in Treasury */}
                <div className="bg-stone-100 rounded-xl p-3 border border-stone-200">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    <Landmark className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t('transparency.treasuryReserve')}</span>
                  </div>
                  <div className="text-lg font-serif font-bold text-stone-900 mt-1">
                    ${result.unspentAmount.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-600 mt-0.5">
                    {t('transparency.inReserves', { pct: result.unspentPercentage })}
                  </div>
                </div>
              </div>

              {/* Dual-Tone Allocation Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-stone-600">
                  <span>{t('transparency.allocationProgress')}</span>
                  <span>{t('transparency.deployed', { pct: result.spentPercentage })}</span>
                </div>
                <div className="h-3 w-full bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-500"
                    style={{ width: `${result.spentPercentage}%` }}
                    title={`${t('transparency.verifiedSpent')}: ${result.spentPercentage}%`}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${result.unspentPercentage}%` }}
                    title={`${t('transparency.treasuryReserve')}: ${result.unspentPercentage}%`}
                  />
                </div>
              </div>

              {/* Itemized Merchant Utilizations */}
              {result.breakdowns && result.breakdowns.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                    {t('transparency.utilizationBreakdown')}
                  </span>
                  <div className="space-y-1.5">
                    {result.breakdowns.map((bd, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-stone-900 truncate">
                            {bd.merchant}
                          </div>
                          <p className="text-[11px] text-stone-600 line-clamp-1 italic">
                            "{bd.purpose}"
                          </p>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {bd.date}
                          </span>
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <span className="font-serif font-bold text-stone-900 text-xs block">
                            ${bd.amount.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded block">
                            {bd.percentage}%
                          </span>
                          {onInspectReceipt && (
                            <button
                              type="button"
                              onClick={() =>
                                onInspectReceipt({
                                  id: `prov-${idx}`,
                                  merchant: bd.merchant,
                                  amount: bd.amount,
                                  items: [bd.purpose],
                                  purpose: bd.purpose,
                                  receiptImageUrl: bd.receiptImageUrl || '',
                                  receiptHash: bd.receiptHash || '',
                                  verifiedBy: 'Monastery Kitchen Steward',
                                  verifiedAt: bd.date,
                                })
                              }
                              className="inline-flex items-center gap-0.5 text-[10px] text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              <Receipt className="w-2.5 h-2.5" />
                              <span>{t('transparency.receipt')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <p className="font-medium">
                    {t('transparency.allPreserved')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs font-semibold text-stone-700">
                {t('transparency.noDonationFound', { hash: searchedQuery })}
              </p>
              <p className="text-[11px] text-stone-500">
                {t('transparency.verifyHashHelp')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProvenanceSearch;
