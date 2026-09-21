import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Package,
  Camera,
  Plus,
  ShieldCheck,
  Truck,
  Heart,
  Key,
} from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { CreatePackageModal } from './CreatePackageModal';
import { UploadProofModal } from './UploadProofModal';
import { CharityPackage } from '../../types';

export interface StewardPortalProps {
  onLock?: () => void;
}

export const StewardPortal: React.FC<StewardPortalProps> = ({ onLock }) => {
  const { isStewardUnlocked, unlockSteward, lockSteward, packages } = useMonasteryStore();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedPackageIdForProof, setSelectedPackageIdForProof] = useState<string | undefined>(undefined);

  // Handle PIN unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockSteward(pin);
    if (success) {
      setPin('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Please try again (Monastery Key: 1080).');
    }
  };

  // Handle Lock
  const handleLock = () => {
    lockSteward();
    if (onLock) onLock();
  };

  const handleOpenProofForPackage = (pkgId: string) => {
    setSelectedPackageIdForProof(pkgId);
    setIsProofModalOpen(true);
  };

  // Metrics
  const activePackagesCount = packages.filter((p) => p.status === 'active').length;
  const totalUnitsFunded = packages.reduce((sum, p) => sum + (p.fundedUnits || 0), 0);
  const totalDistributedWithProof = packages.reduce((sum, p) => sum + (p.distributedUnits || 0), 0);

  // --- LOCKED STATE: PIN GUARD ---
  if (!isStewardUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
        <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">
              Monk Steward Access
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Administrative workspace for monastery stewards to launch charity packages and seal on-chain distribution proofs.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="text-left">
              <label
                htmlFor="steward-pin"
                className="block text-xs font-medium text-stone-300 mb-1.5"
              >
                Enter Steward PIN
              </label>
              <div className="relative">
                <input
                  id="steward-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="••••"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-hidden focus:border-amber-500 text-center tracking-widest text-lg font-mono"
                  autoFocus
                />
                <Key className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-medium">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Portal</span>
            </button>
          </form>

          <div className="pt-2 border-t border-stone-800/80">
            <button
              type="button"
              onClick={() => {
                setPin('1080');
                if (pinError) setPinError('');
              }}
              className="text-[11px] text-stone-500 hover:text-amber-400 transition-colors"
            >
              Demo Steward Key: <span className="font-mono text-stone-400 underline">1080</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UNLOCKED STATE: STEWARD WORKSPACE ---
  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Header & Lock Portal Button */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
              Monastery Steward Workspace
            </h1>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Verified Abbot &amp; Monastery Steward Control Panel
          </p>
        </div>

        <button
          type="button"
          onClick={handleLock}
          className="px-3 py-1.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          aria-label="Lock Portal"
        >
          <Lock className="w-3.5 h-3.5 text-stone-400" />
          <span>Lock Portal</span>
        </button>
      </div>

      {/* Verified Monk Banner */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong>🧘 Monk Steward Mode:</strong> You have verified administrative access (Monastery Key: 1080).
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Signer Active
        </span>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Active Packages</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {activePackagesCount}
          </div>
          <p className="text-[11px] text-stone-500">{packages.length} total packages created</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Total Units Funded</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {totalUnitsFunded}
          </div>
          <p className="text-[11px] text-stone-500">Sponsored by devotees globally</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Distributed with Proof</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {totalDistributedWithProof}
          </div>
          <p className="text-[11px] text-stone-500">Verified via on-chain Merkle root</p>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Charity Package</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedPackageIdForProof(undefined);
            setIsProofModalOpen(true);
          }}
          className="py-3.5 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 active:scale-[0.98] border border-stone-700 text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Camera className="w-4 h-4" />
          <span>Upload Proof of Giving</span>
        </button>
      </div>

      {/* Managed Charity Packages List */}
      <section className="space-y-3" aria-label="Managed Charity Packages">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-serif font-bold text-white">
            Managed Charity Packages
          </h2>
          <span className="text-xs text-stone-400">{packages.length} packages listed</span>
        </div>

        <div className="space-y-3">
          {packages.map((pkg) => {
            const pendingDelivery = Math.max(0, pkg.fundedUnits - pkg.distributedUnits);
            const fundedPct = pkg.targetUnits > 0 ? Math.min(100, Math.round((pkg.fundedUnits / pkg.targetUnits) * 100)) : 100;
            const distributedPct = pkg.targetUnits > 0 ? Math.min(100, Math.round((pkg.distributedUnits / pkg.targetUnits) * 100)) : 100;

            const statusColors: Record<CharityPackage['status'], { badge: string; text: string }> = {
              active: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', text: 'Active' },
              fully_funded: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', text: 'Fully Funded' },
              completed: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'Completed' },
            };

            const statusInfo = statusColors[pkg.status] || statusColors.active;

            return (
              <div
                key={pkg.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 hover:border-stone-700 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={pkg.coverImageUrl}
                      alt={pkg.title}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-stone-800"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-bold text-white text-sm sm:text-base">
                          {pkg.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badge}`}
                        >
                          {statusInfo.text}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-300 border border-stone-700 capitalize">
                          {pkg.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenProofForPackage(pkg.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Proof</span>
                    </button>
                  </div>
                </div>

                {/* Progress bars & statistics */}
                <div className="bg-stone-950/70 rounded-xl p-3 space-y-2 border border-stone-800/80">
                  <div className="flex justify-between text-xs text-stone-300 font-medium">
                    <span>
                      ${pkg.unitPrice} / kit &bull; {pkg.fundedUnits} / {pkg.targetUnits} funded
                    </span>
                    <span className="text-amber-400">{fundedPct}%</span>
                  </div>

                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${distributedPct}%` }}
                      title={`Distributed: ${pkg.distributedUnits} units`}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${Math.max(0, fundedPct - distributedPct)}%` }}
                      title={`Awaiting delivery: ${pendingDelivery} units`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                    <span className="text-emerald-400 font-medium">
                      ✓ {pkg.distributedUnits} units sealed with proof
                    </span>
                    <span className={pendingDelivery > 0 ? 'text-amber-400 font-medium' : 'text-stone-500'}>
                      {pendingDelivery} pending delivery
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modals */}
      <CreatePackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <UploadProofModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        preselectedPackageId={selectedPackageIdForProof}
      />
    </div>
  );
};

export default StewardPortal;
