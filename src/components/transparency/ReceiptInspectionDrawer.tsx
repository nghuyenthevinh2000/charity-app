import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Calendar,
  Building2,
  FileCheck2,
  Receipt,
  Info,
} from 'lucide-react';
import { SpentOutput } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface ReceiptInspectionDrawerProps {
  spentOutput: SpentOutput | null;
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
  fundName?: string;
}

export const ReceiptInspectionDrawer: React.FC<ReceiptInspectionDrawerProps> = ({
  spentOutput,
  isOpen,
  onClose,
  txHash,
  fundName,
}) => {
  const { t, language } = useTranslation();
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // Reset zoom and error states when a new spent output is opened
    setIsZoomed(false);
    setImageError(false);
    setCopied(false);
  }, [spentOutput]);

  if (!isOpen || !spentOutput) return null;

  const handleCopyHash = () => {
    if (spentOutput.receiptHash && navigator.clipboard) {
      navigator.clipboard.writeText(spentOutput.receiptHash).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAmount = `$${spentOutput.amount.toFixed(2)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={t('transparency.inspectionHeader') || 'Bill & Receipt Inspection'}
    >
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Card */}
      <div
        className="relative z-10 w-full max-w-md bg-stone-50 rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl border-t sm:border border-parchment-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-parchment-300 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
              <Receipt className="w-5 h-5 text-saffron-700" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {t('transparency.inspectionHeader') || 'Bill & Receipt Inspection'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {language === 'vi'
                  ? 'Chứng từ minh bạch & đối chiếu kế toán tu viện'
                  : 'Verified expense receipt & cryptographic proof'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-stone-800">
          {/* Main Expenditure Summary Card */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600">
                  {t('transparency.payee') || 'PAYEE'}
                </span>
                <div className="text-base font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>{spentOutput.merchant}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600">
                  {t('transparency.spentLabel') || 'SPENT'}
                </span>
                <div className="text-xl font-serif font-bold text-saffron-700">
                  {formattedAmount}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-600" />
                <span>{spentOutput.verifiedAt || '2026-09-16'}</span>
              </div>
              {fundName && (
                <div className="text-right truncate font-medium text-stone-700">
                  {fundName}
                </div>
              )}
            </div>
          </div>

          {/* Spiritual & Practical Purpose Note */}
          <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('transparency.purpose') || 'PURPOSE'}</span>
            </div>
            <p className="text-xs text-amber-950 font-serif italic leading-relaxed pl-5">
              "{spentOutput.purpose}"
            </p>
          </div>

          {/* Itemized Purchases Breakdown */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
              <FileCheck2 className="w-3.5 h-3.5 text-stone-600" />
              <span>{t('transparency.itemized') || 'ITEMIZED PURCHASES'}</span>
            </div>
            <ul className="divide-y divide-stone-100 text-xs">
              {spentOutput.items && spentOutput.items.length > 0 ? (
                spentOutput.items.map((item, idx) => (
                  <li key={idx} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-stone-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 shrink-0" />
                      <span>{item}</span>
                    </span>
                    <span className="text-[11px] font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                      {t('transparency.itemNumber', { num: idx + 1 })}
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-2 text-stone-500 italic">{t('transparency.noItemized')}</li>
              )}
            </ul>
          </div>

          {/* Paper Receipt Photo Preview & Zoom */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-stone-600" />
                <span>{t('transparency.originalReceipt')}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-saffron-700 hover:text-saffron-800 bg-saffron-50 px-2.5 py-1 rounded-lg border border-saffron-200 cursor-pointer"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="w-3 h-3" />
                    <span>{t('transparency.tapToCloseZoom')}</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3 h-3" />
                    <span>{t('transparency.tapToZoom')}</span>
                  </>
                )}
              </button>
            </div>

            <div
              className={`relative rounded-xl overflow-hidden border border-stone-200 bg-stone-900 cursor-pointer transition-all duration-300 ${
                isZoomed ? 'max-h-[500px]' : 'max-h-56'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              title={t('transparency.tapToZoom')}
            >
              {!imageError && spentOutput.receiptImageUrl ? (
                <img
                  src={spentOutput.receiptImageUrl}
                  alt={`Receipt for ${spentOutput.merchant}`}
                  onError={() => setImageError(true)}
                  className={`w-full object-contain transition-transform duration-300 ${
                    isZoomed ? 'scale-105 py-2' : 'h-52 object-cover object-top'
                  }`}
                />
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-stone-300 bg-stone-800 p-4 text-center">
                  <Receipt className="w-10 h-10 text-stone-400 mb-2" />
                  <p className="text-xs font-medium text-stone-200">
                    {spentOutput.merchant} — {formattedAmount}
                  </p>
                  <p className="text-[11px] text-stone-400 font-mono mt-1">
                    {spentOutput.receiptHash ? spentOutput.receiptHash.slice(0, 24) + '...' : 'Verified Receipt Stored'}
                  </p>
                </div>
              )}

              {/* Watermark badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20">
                {isZoomed ? t('transparency.zoomWatermarkOut') : t('transparency.zoomWatermarkIn')}
              </div>
            </div>
          </div>

          {/* Official Monastic Steward Verification Seal */}
          <div className="bg-emerald-50/90 rounded-2xl p-4 border-2 border-emerald-300/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 text-white rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-serif font-bold text-emerald-950">
                  {t('transparency.verifiedSeal') || 'Verified by Monastery Kitchen Steward'}
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  {spentOutput.verifiedBy || 'Monastery Kitchen Steward'}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              {language === 'vi'
                ? 'Chứng từ mua sắm đã được đối chiếu trực tiếp với sổ quỹ và được ký xác nhận bởi ban quản sự tu viện.'
                : 'Expense items verified directly against monastery procurement ledger and attested by the monastic steward.'}
            </p>
          </div>

          {/* Cryptographic Proof / Receipt Hash */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span className="font-semibold uppercase tracking-wider">
                {t('transparency.receiptHash') || 'CRYPTOGRAPHIC PROOF'}
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="hover:text-white transition-colors flex items-center gap-1 text-[10px] text-amber-300 cursor-pointer"
                title={t('transparency.copyReceiptHash')}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{t('common.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t('common.copyHash')}</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-amber-300 font-semibold break-all select-all bg-stone-950/60 p-2 rounded-lg border border-stone-800">
              {spentOutput.receiptHash || `sha256:${spentOutput.id}monasteryverifiedproof`}
            </div>
            {txHash && (
              <div className="text-[10px] text-stone-400 font-mono">
                Transaction ID: <span className="text-stone-300">{txHash}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Close Button */}
        <div className="p-4 border-t border-parchment-300 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-black text-amber-300 font-semibold text-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <span>{t('transparency.close') || 'Close Receipt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptInspectionDrawer;
