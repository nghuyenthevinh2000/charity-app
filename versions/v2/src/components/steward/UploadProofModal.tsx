import React, { useState, useEffect, useMemo } from 'react';
import { Camera, X, CheckCircle, ShieldCheck, User, Plus, Trash2 } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { generateMerkleRoot } from '../../utils/crypto';

export interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackageId?: string;
}

interface PhotoEntry {
  url: string;
  caption: string;
  beneficiaryNote: string;
}

const SAMPLE_PHOTOS: PhotoEntry[] = [
  {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&auto=format&fit=crop&q=80',
    caption: 'Direct delivery of winter relief supplies to mountain households.',
    beneficiaryNote: 'Thank you venerables and devotees for bringing warmth to our children.',
  },
  {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&auto=format&fit=crop&q=80',
    caption: 'Students receiving notebooks and warm winter study kits.',
    beneficiaryNote: 'The notebooks will help us study through the cold season without fear.',
  },
];

export const UploadProofModal: React.FC<UploadProofModalProps> = ({
  isOpen,
  onClose,
  preselectedPackageId,
}) => {
  const { packages, uploadGivingProof } = useMonasteryStore();

  // Active packages with pending distribution or all packages if none pending
  const selectablePackages = useMemo(() => {
    const pending = packages.filter(
      (p) => p.fundedUnits > p.distributedUnits || p.id === preselectedPackageId
    );
    return pending.length > 0 ? pending : packages;
  }, [packages, preselectedPackageId]);

  const [packageId, setPackageId] = useState<string>('');
  const [unitsDistributed, setUnitsDistributed] = useState<string>('10');
  const [location, setLocation] = useState('Dong Van Valley, Ha Giang');
  const [attestingMonk, setAttestingMonk] = useState('Ven. Thich Tam An');
  const [missionReport, setMissionReport] = useState('');
  const [photos, setPhotos] = useState<PhotoEntry[]>([SAMPLE_PHOTOS[0]]);
  const [error, setError] = useState('');

  // Update selected package when preselectedPackageId or selectablePackages change
  useEffect(() => {
    if (preselectedPackageId && packages.some((p) => p.id === preselectedPackageId)) {
      setPackageId(preselectedPackageId);
      const pkg = packages.find((p) => p.id === preselectedPackageId);
      if (pkg) {
        const pending = Math.max(1, pkg.fundedUnits - pkg.distributedUnits);
        setUnitsDistributed(String(pending));
      }
    } else if (selectablePackages.length > 0 && !packageId) {
      setPackageId(selectablePackages[0].id);
      const pending = Math.max(1, selectablePackages[0].fundedUnits - selectablePackages[0].distributedUnits);
      setUnitsDistributed(String(pending));
    }
  }, [preselectedPackageId, selectablePackages, packages]);

  // Live calculation of preview Merkle root
  const previewMerkleRoot = useMemo(() => {
    const leaves = photos.map((p) => p.url).filter(Boolean);
    if (leaves.length === 0) {
      leaves.push(packageId || 'pkg-default', location || 'field-distribution');
    }
    return generateMerkleRoot(leaves);
  }, [photos, packageId, location]);

  if (!isOpen) return null;

  const handlePackageChange = (newPkgId: string) => {
    setPackageId(newPkgId);
    const pkg = packages.find((p) => p.id === newPkgId);
    if (pkg) {
      const pending = Math.max(1, pkg.fundedUnits - pkg.distributedUnits);
      setUnitsDistributed(String(pending));
    }
  };

  const handlePhotoChange = (idx: number, field: keyof PhotoEntry, val: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleAddPhoto = () => {
    const nextSample = SAMPLE_PHOTOS[photos.length % SAMPLE_PHOTOS.length];
    setPhotos((prev) => [...prev, { ...nextSample }]);
  };

  const handleRemovePhoto = (idx: number) => {
    if (photos.length <= 1) return;
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageId) {
      setError('Please select a charity package for proof verification.');
      return;
    }

    const unitsNum = Number(unitsDistributed);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      setError('Please provide a valid number of units distributed.');
      return;
    }

    if (!location.trim()) {
      setError('Please provide the distribution village / location.');
      return;
    }

    const validPhotos = photos.filter((p) => p.url.trim().length > 0);
    const photosToSubmit = validPhotos.length > 0 ? validPhotos : [SAMPLE_PHOTOS[0]];

    uploadGivingProof({
      packageId,
      unitsDistributed: unitsNum,
      location: location.trim(),
      attestingMonk: attestingMonk.trim() || 'Ven. Thich Tam An',
      missionReport:
        missionReport.trim() ||
        `On-site distribution completed by ${attestingMonk} in ${location}. Aid delivered directly to verified recipient families.`,
      heartfeltPhotos: photosToSubmit,
    });

    // Reset and close
    setMissionReport('');
    setError('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-proof-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl p-5 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="upload-proof-title" className="text-lg font-serif font-bold text-white">
                Upload Proof of Giving
              </h2>
              <p className="text-xs text-stone-400">
                Attach field delivery photo, record recipient notes, and sign on-chain
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Select Package */}
          <div>
            <label htmlFor="proof-package-id" className="block text-stone-300 font-medium mb-1">
              Select Active Package <span className="text-emerald-400">*</span>
            </label>
            <select
              id="proof-package-id"
              value={packageId}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-hidden focus:border-emerald-500 text-xs"
            >
              {selectablePackages.map((pkg) => {
                const pending = Math.max(0, pkg.fundedUnits - pkg.distributedUnits);
                return (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} ({pending} Pending Delivery)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Units Distributed & Village Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="proof-units-distributed" className="block text-stone-300 font-medium mb-1">
                Units Distributed <span className="text-emerald-400">*</span>
              </label>
              <input
                id="proof-units-distributed"
                type="number"
                min="1"
                step="1"
                value={unitsDistributed}
                onChange={(e) => setUnitsDistributed(e.target.value)}
                placeholder="10"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-hidden focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label htmlFor="proof-location" className="block text-stone-300 font-medium mb-1">
                Village / Location <span className="text-emerald-400">*</span>
              </label>
              <input
                id="proof-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dong Van Valley, Ha Giang"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-hidden focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Attesting Monk */}
          <div>
            <label htmlFor="proof-attesting-monk" className="block text-stone-300 font-medium mb-1">
              Attesting Monk Name
            </label>
            <div className="relative">
              <input
                id="proof-attesting-monk"
                type="text"
                value={attestingMonk}
                onChange={(e) => setAttestingMonk(e.target.value)}
                placeholder="Ven. Thich Tam An"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-8 pr-3 py-2.5 text-stone-100 focus:outline-hidden focus:border-emerald-500 text-xs"
              />
              <User className="w-4 h-4 text-stone-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Mission Report */}
          <div>
            <label htmlFor="proof-mission-report" className="block text-stone-300 font-medium mb-1">
              Field Mission Report Narrative
            </label>
            <textarea
              id="proof-mission-report"
              rows={2}
              value={missionReport}
              onChange={(e) => setMissionReport(e.target.value)}
              placeholder="Describe road conditions, distribution proceedings, and village situation..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-emerald-500 text-xs resize-none"
            />
          </div>

          {/* Heartfelt Photos Attachment Section */}
          <div className="space-y-2 pt-1 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-stone-300 font-medium">Heartfelt Photos & Beneficiary Voices</span>
              <button
                type="button"
                onClick={handleAddPhoto}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Photo</span>
              </button>
            </div>

            <div className="space-y-3">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="bg-stone-950/80 border border-stone-800 rounded-xl p-3 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-medium">Photo #{idx + 1}</span>
                    {photos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="text-stone-500 hover:text-rose-400 transition-colors"
                        aria-label={`Remove photo ${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`photo-url-${idx}`} className="block text-[11px] text-stone-400 mb-0.5">
                      Photo URL
                    </label>
                    <input
                      id={`photo-url-${idx}`}
                      type="url"
                      value={photo.url}
                      onChange={(e) => handlePhotoChange(idx, 'url', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 text-[11px] focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor={`photo-caption-${idx}`} className="block text-[11px] text-stone-400 mb-0.5">
                        Caption
                      </label>
                      <input
                        id={`photo-caption-${idx}`}
                        type="text"
                        value={photo.caption}
                        onChange={(e) => handlePhotoChange(idx, 'caption', e.target.value)}
                        placeholder="Caption describing delivery"
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 text-[11px] focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`photo-note-${idx}`} className="block text-[11px] text-stone-400 mb-0.5">
                        Beneficiary Quote
                      </label>
                      <input
                        id={`photo-note-${idx}`}
                        type="text"
                        value={photo.beneficiaryNote}
                        onChange={(e) => handlePhotoChange(idx, 'beneficiaryNote', e.target.value)}
                        placeholder="Words of gratitude"
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 text-[11px] focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Sealing Indicator & Preview */}
          <div className="bg-stone-950 border border-emerald-500/30 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cryptographic Sealing Preview</span>
            </div>
            <div className="space-y-1 text-[11px] text-stone-400 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Tree Standard:</span>
                <span className="text-stone-300">256-bit Merkle Leaf Attestation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Leaves:</span>
                <span className="text-stone-300">{photos.length} photos + location seal</span>
              </div>
              <div className="truncate">
                <span className="text-stone-500">Merkle Root: </span>
                <span className="text-emerald-300">{previewMerkleRoot}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>⛓️ Seal &amp; Record Proof On-Chain</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
