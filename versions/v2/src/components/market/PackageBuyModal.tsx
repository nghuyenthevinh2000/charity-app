import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Heart,
  Scroll,
} from 'lucide-react';
import { CharityPackage, PackagePurchase } from '../../types';
import { useMonasteryStore } from '../../context/MonasteryStore';

export interface PackageBuyModalProps {
  pkg: CharityPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (purchase: PackagePurchase) => void;
}

const PRESET_UNITS = [1, 2, 5, 10];

export const PackageBuyModal: React.FC<PackageBuyModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { purchasePackage } = useMonasteryStore();

  const [units, setUnits] = useState<number>(1);
  const [donorName, setDonorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [dedicationNote, setDedicationNote] = useState<string>('');

  // Confirmation state
  const [completedPurchase, setCompletedPurchase] = useState<PackagePurchase | null>(null);
  const [showCertificateView, setShowCertificateView] = useState<boolean>(false);
  const [copiedTx, setCopiedTx] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Reset state whenever modal opens with a new package
  useEffect(() => {
    if (isOpen) {
      setUnits(1);
      setDonorName('');
      setIsAnonymous(false);
      setDedicationNote('');
      setCompletedPurchase(null);
      setShowCertificateView(false);
      setCopiedTx(false);
      setShowConfetti(false);
    }
  }, [isOpen, pkg?.id]);

  if (!isOpen || !pkg) return null;

  const totalAmount = units * pkg.unitPrice;

  const handleIncrement = () => setUnits((prev) => prev + 1);
  const handleDecrement = () => setUnits((prev) => Math.max(1, prev - 1));

  const handleConfirmSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (units < 1) return;

    const purchase = purchasePackage({
      packageId: pkg.id,
      unitsBought: units,
      donorName: isAnonymous ? 'Anonymous Devotee' : (donorName.trim() || 'Devotee'),
      isAnonymous,
      dedicationNote: dedicationNote.trim() || undefined,
    });

    setCompletedPurchase(purchase);
    setShowConfetti(true);
    if (onSuccess) {
      onSuccess(purchase);
    }
  };

  const handleCopyTx = () => {
    if (completedPurchase && navigator.clipboard) {
      navigator.clipboard.writeText(completedPurchase.txHash).catch(() => {});
    }
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleModalClose = () => {
    setCompletedPurchase(null);
    setShowCertificateView(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-buy-modal-title"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-stone-200 relative my-auto overflow-hidden animate-fadeIn">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* POST-PURCHASE CONFIRMATION STATE */}
        {completedPurchase ? (
          <div className="space-y-4 text-center">
            {/* Confetti Floral Petals Visual Banner */}
            {showConfetti && (
              <div className="flex justify-center gap-2 text-2xl animate-bounce">
                <span>🌸</span>
                <span>✨</span>
                <span>🪷</span>
                <span>✨</span>
                <span>🌸</span>
              </div>
            )}

            {/* Sacred Lotus Seal Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-stone-900 shadow-md ring-4 ring-amber-200/60 mx-auto">
              <span className="text-3xl" role="img" aria-label="Lotus Seal">
                🪷
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Offering Blessed &amp; Recorded
              </h3>
              <p className="text-xs text-stone-600">
                Your charity package sponsorship has been recorded on-chain with immutable cryptographic proof.
              </p>
            </div>

            {/* Certificate Details or Summary Box */}
            {showCertificateView ? (
              <div className="relative bg-gradient-to-b from-amber-50/90 via-white to-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-4 text-left space-y-2.5 shadow-sm text-xs">
                <div className="text-center pb-2 border-b border-dashed border-amber-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Digital Blessing Certificate
                  </span>
                  <h4 className="font-serif font-bold text-stone-900 text-sm mt-1">
                    {completedPurchase.packageTitle}
                  </h4>
                  <div className="text-amber-700 font-bold text-base mt-0.5">
                    {completedPurchase.unitsBought} Package{completedPurchase.unitsBought > 1 ? 's' : ''} &bull; ${completedPurchase.totalAmount}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Dedicated By:</span>
                    <span className="font-semibold text-stone-900">{completedPurchase.donorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-medium">Status:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Queued for Monk Delivery
                    </span>
                  </div>
                  {completedPurchase.dedicationNote && (
                    <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60 mt-1 italic text-stone-700">
                      "{completedPurchase.dedicationNote}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Cryptographic On-Chain Receipt Box */
              <div className="bg-stone-900 text-stone-100 rounded-xl p-3.5 text-left space-y-2 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Block #{completedPurchase.blockNumber}
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                    Verified On-Chain
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>Cryptographic TX Hash:</span>
                    <button
                      type="button"
                      onClick={handleCopyTx}
                      className="text-amber-300 hover:text-white flex items-center gap-0.5 cursor-pointer"
                      title="Copy transaction hash"
                    >
                      {copiedTx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-amber-300 font-bold text-xs break-all select-all bg-black/40 p-2 rounded border border-stone-800">
                    {completedPurchase.txHash}
                  </div>
                </div>

                <div className="text-[11px] text-stone-300 pt-1 border-t border-stone-800 flex justify-between">
                  <span>Sponsored:</span>
                  <span className="text-white font-semibold">
                    {completedPurchase.unitsBought}x {completedPurchase.packageTitle} (${completedPurchase.totalAmount})
                  </span>
                </div>
              </div>
            )}

            {/* Toggle Certificate / Proof View */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCertificateView((prev) => !prev)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 text-amber-900 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Scroll className="w-4 h-4 text-amber-700" />
                <span>
                  {showCertificateView ? 'View Cryptographic TX Receipt' : 'View Blessing Certificate'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Complete &amp; Return to Sanctuary
              </button>
            </div>
          </div>
        ) : (
          /* SPONSORSHIP PURCHASE FORM */
          <form onSubmit={handleConfirmSponsorship} className="space-y-4">
            {/* Header */}
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                🙏 Buddhist Alms &amp; Direct Relief
              </span>
              <h3
                id="package-buy-modal-title"
                className="text-lg sm:text-xl font-serif font-bold text-stone-900 leading-snug"
              >
                Sponsor {pkg.title}
              </h3>
              <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                <span className="font-semibold text-amber-700">${pkg.unitPrice} per package</span>
                <span>&bull;</span>
                <span>Curated by {pkg.createdByMonk || 'Monastery Stewards'}</span>
              </div>
            </div>

            {/* Quantity Selector Section */}
            <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  Select Quantity:
                </label>
                <span className="text-xs text-stone-500 font-medium">
                  ${pkg.unitPrice} &times; {units} = <strong className="text-amber-700 font-bold text-sm">${totalAmount}</strong>
                </span>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_UNITS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setUnits(preset)}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      units === preset
                        ? 'bg-amber-500 text-stone-950 border-amber-600 ring-2 ring-amber-400 shadow-xs'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {preset} Kit{preset > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              {/* Stepper + / - Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-600">Custom count:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={units <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40 flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-stone-900">
                    {units}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-8 h-8 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Donor Name & Anonymous Switch */}
            <div className="space-y-1.5">
              <label
                htmlFor="donor-name-input"
                className="block text-xs font-semibold text-stone-700"
              >
                Donor Name
              </label>
              <input
                id="donor-name-input"
                type="text"
                disabled={isAnonymous}
                value={isAnonymous ? '' : donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder={isAnonymous ? 'Anonymous Devotee' : 'Your name or family name (e.g. Devotee Nguyen)'}
                aria-label="Donor Name"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 disabled:bg-stone-100 disabled:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />

              <label className="flex items-center gap-2 pt-0.5 cursor-pointer text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  aria-label="Remain Anonymous"
                  className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Remain Anonymous</span>
              </label>
            </div>

            {/* Dedication / Prayer Note Textarea */}
            <div className="space-y-1">
              <label
                htmlFor="dedication-note-input"
                className="block text-xs font-semibold text-stone-700"
              >
                Prayer Dedication / Blessing Note
              </label>
              <textarea
                id="dedication-note-input"
                rows={2}
                value={dedicationNote}
                onChange={(e) => setDedicationNote(e.target.value)}
                placeholder="Write your prayer dedication, intention or blessing for the recipients..."
                aria-label="Prayer Dedication"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
              />
            </div>

            {/* Total Summary and CTA Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 active:scale-[0.99] text-white font-serif font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                <span>Confirm Sponsorship &bull; ${totalAmount}</span>
              </button>

              <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
                <span>⛓️ Cryptographically sealed on-chain</span>
                <span>&bull;</span>
                <span>Monks verify field photo proof</span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PackageBuyModal;
