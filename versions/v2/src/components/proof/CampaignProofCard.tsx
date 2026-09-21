import React, { useState, useRef } from 'react';
import {
  Info,
  MessageCircle,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  MapPin,
} from 'lucide-react';
import { GivingProofBatch } from '../../types';
import { useMonasteryStore } from '../../context/MonasteryStore';

export interface CampaignProofCardProps {
  proof: GivingProofBatch;
  id?: string;
  isFirst?: boolean;
}

export const CampaignProofCard: React.FC<CampaignProofCardProps> = ({ proof, id, isFirst = true }) => {
  const { addCommentToProof } = useMonasteryStore();

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [activeDrawer, setActiveDrawer] = useState<'details' | 'comments' | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [copiedRoot, setCopiedRoot] = useState<boolean>(false);

  // Touch handlers for photo swiping
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const photos = proof.heartfeltPhotos || [];
  const totalPhotos = photos.length;
  const currentPhoto = photos[currentPhotoIndex] || {
    id: 'placeholder',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&auto=format&fit=crop&q=80',
    caption: proof.packageTitle,
    beneficiaryNote: proof.missionReport,
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalPhotos <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalPhotos <= 1) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches?.[0];
    if (touch) {
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const touch = e.changedTouches?.[0];
    if (touch) {
      const deltaX = touch.clientX - touchStartXRef.current;
      const deltaY =
        touchStartYRef.current !== null ? touch.clientY - touchStartYRef.current : 0;
      const SWIPE_THRESHOLD = 40;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < -SWIPE_THRESHOLD) {
          handleNextPhoto();
        } else if (deltaX > SWIPE_THRESHOLD) {
          handlePrevPhoto();
        }
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const toggleDrawer = (type: 'details' | 'comments') => {
    setActiveDrawer((prev) => (prev === type ? null : type));
  };

  const handleCopyMerkleRoot = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(proof.merkleRootHash);
        setCopiedRoot(true);
        setTimeout(() => setCopiedRoot(false), 2000);
      }
    } catch {
      // Ignore clipboard error in unsupported contexts
    }
  };

  const handlePostComment = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = newCommentText.trim();
    if (!text) return;

    addCommentToProof(proof.id, {
      authorName: 'Devotee',
      authorRole: 'devotee',
      commentText: text,
    });
    setNewCommentText('');
  };

  const commentsCount = proof.comments ? proof.comments.length : 0;

  return (
    <article
      id={id || `proof-card-${proof.id}`}
      data-testid={`proof-card-${proof.id}`}
      className="h-[calc(100vh-220px)] min-h-[580px] w-full relative overflow-hidden rounded-3xl snap-start border border-stone-800 bg-stone-950 shadow-2xl text-white select-none transition-all"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* FULL-BLEED BACKGROUND PHOTO */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-stone-900">
        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption || proof.packageTitle}
          className="w-full h-full object-cover pointer-events-none select-none"
        />
        {/* Dark contrast gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/90 pointer-events-none" />
      </div>

      {/* TOP FLOATING OVERLAY: PACKAGE TITLE, DELIVERED BADGE, VILLAGE LOCATION & BLOCK HEIGHT */}
      <header className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Package Title & Delivered Badge */}
          <div className="flex items-center gap-2 bg-stone-950/75 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-lg max-w-[70%]">
            <span className="text-base">📦</span>
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {proof.packageTitle}
            </span>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0">
              {proof.unitsDistributed} Given ✓
            </span>
          </div>

          {/* Block Number and Photo Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {totalPhotos > 0 && (
              <span className="text-[11px] font-semibold bg-stone-950/75 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full shadow-sm">
                📸 {currentPhotoIndex + 1} / {totalPhotos}
              </span>
            )}
            <span className="text-[11px] font-mono bg-stone-950/75 backdrop-blur-md text-stone-300 border border-stone-700/60 px-2.5 py-1 rounded-full shadow-sm">
              Block #{proof.blockNumber}
            </span>
          </div>
        </div>

        {/* Village Location Badge */}
        <div className="flex items-center gap-1 self-start bg-stone-950/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[11px] text-stone-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{proof.location}</span>
        </div>
      </header>

      {/* HORIZONTAL SWIPE ARROW CONTROLS */}
      {totalPhotos > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrevPhoto}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-stone-950/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-stone-900/80 active:scale-95 transition-all shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextPhoto}
            aria-label="Next photo"
            className="absolute right-16 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-stone-950/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-stone-900/80 active:scale-95 transition-all shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* FLOATING RIGHT ACTION DOCK (Details & Comments Buttons) */}
      <aside
        className={`absolute right-4 transition-all duration-300 ${
          activeDrawer ? 'bottom-[calc(50%+1rem)]' : 'bottom-6'
        } flex flex-col gap-3 z-30 items-center`}
      >
        {/* Toggle Details Button */}
        <button
          type="button"
          onClick={() => toggleDrawer('details')}
          aria-label={isFirst ? 'Toggle proof details' : `Details for ${proof.packageTitle}`}
          title="Toggle Proof Details & Merkle Seal"
          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
            activeDrawer === 'details'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-amber-600/50'
              : 'bg-stone-900/85 backdrop-blur-md border border-white/25 text-stone-200 hover:bg-stone-800'
          }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-tight mt-0.5">Details</span>
        </button>

        {/* Toggle Comments Button */}
        <button
          type="button"
          onClick={() => toggleDrawer('comments')}
          aria-label={isFirst ? 'Toggle comments' : `Comments for ${proof.packageTitle}`}
          title="Sangha Reflections & Comments"
          className={`w-12 h-12 rounded-full flex flex-col items-center justify-center relative transition-all shadow-xl active:scale-95 ${
            activeDrawer === 'comments'
              ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-amber-600/50'
              : 'bg-stone-900/85 backdrop-blur-md border border-white/25 text-stone-200 hover:bg-stone-800'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-tight mt-0.5">Comments</span>
          {commentsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-stone-950 shadow-md">
              {commentsCount}
            </span>
          )}
        </button>
      </aside>

      {/* BOTTOM BANNER (Visible when Drawers are closed) */}
      {!activeDrawer && (
        <div className="absolute bottom-0 left-0 right-16 p-6 z-10 flex flex-col gap-2 pointer-events-none">
          {/* Photo Dots indicator */}
          {totalPhotos > 1 && (
            <div className="flex items-center gap-1.5 mb-1">
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentPhotoIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md leading-snug line-clamp-2">
            {currentPhoto.caption}
          </h3>
          {currentPhoto.beneficiaryNote && (
            <p className="text-xs sm:text-sm text-stone-200/90 italic drop-shadow-sm line-clamp-3">
              "{currentPhoto.beneficiaryNote}"
            </p>
          )}
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 pt-1 drop-shadow-sm">
            <span>🧘 Attested by {proof.attestingMonk}</span>
          </div>
        </div>
      )}

      {/* 50% BOTTOM SHEET DRAWER (MUTUALLY EXCLUSIVE DETAILS VS COMMENTS) */}
      {activeDrawer && (
        <section
          aria-label={activeDrawer === 'details' ? 'Mission details drawer' : 'Comments drawer'}
          className="absolute bottom-0 left-0 right-0 h-[50%] bg-stone-900/95 backdrop-blur-xl border-t border-amber-500/30 rounded-t-3xl p-5 z-20 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        >
          {/* DRAWER VIEW: DETAILS */}
          {activeDrawer === 'details' && (
            <div className="flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">ℹ️</span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Mission Report &amp; Merkle Seal
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  aria-label="Close drawer"
                  className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Attesting Monk & Mission Narrative */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-semibold text-xs sm:text-sm flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    {proof.attestingMonk}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-medium">
                    Monastery Seal ✓
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                  <strong className="text-amber-300 block mb-1">Field Mission Narrative:</strong>
                  {proof.missionReport}
                </p>

                {currentPhoto.beneficiaryNote && (
                  <div className="bg-amber-950/30 border border-amber-500/25 p-3 rounded-xl">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide block mb-1">
                      Beneficiary Voice:
                    </span>
                    <p className="text-xs text-stone-200 italic">"{currentPhoto.beneficiaryNote}"</p>
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block mb-0.5">Units Distributed</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {proof.unitsDistributed} Kits Delivered ✓
                  </span>
                </div>
                <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block mb-0.5">Distribution Date</span>
                  <span className="text-sm font-bold text-sky-400">{proof.distributionDate}</span>
                </div>
              </div>

              {/* Cryptographic Verification Hashes */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 font-mono text-[11px] space-y-2">
                <div>
                  <span className="text-stone-500 block text-[10px]">DISTRIBUTION TX</span>
                  <span className="text-sky-400 break-all select-all">{proof.distributionTxHash}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 text-[10px]">PHOTO MERKLE ROOT</span>
                    <button
                      type="button"
                      onClick={handleCopyMerkleRoot}
                      aria-label="Copy Merkle root"
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-sans"
                    >
                      {copiedRoot ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Root</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-emerald-400 break-all select-all block mt-0.5">
                    {proof.merkleRootHash}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-800/80 text-[10px] text-stone-400 font-sans">
                  <span>Monastery Block #{proof.blockNumber}</span>
                  <span className="text-amber-400 font-medium">Cryptographically Anchored</span>
                </div>
              </div>
            </div>
          )}

          {/* DRAWER VIEW: COMMENTS */}
          {activeDrawer === 'comments' && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-800 shrink-0 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Sangha Reflections &amp; Community Notes
                  </h4>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    {commentsCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  aria-label="Close drawer"
                  className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 mb-3">
                {commentsCount === 0 ? (
                  <div className="text-center py-6 text-stone-400 text-xs italic">
                    No reflections yet. Be the first to share a blessing or rejoice in merit.
                  </div>
                ) : (
                  proof.comments.map((cmt) => {
                    const isMonk = cmt.authorRole === 'monk';
                    return (
                      <div
                        key={cmt.id}
                        className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-semibold ${
                                isMonk ? 'text-amber-400' : 'text-sky-400'
                              }`}
                            >
                              {isMonk ? '🧘 ' : '🙏 '}
                              {cmt.authorName}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                isMonk
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {isMonk ? cmt.monkBadge || 'Monk ✓' : 'Devotee'}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {new Date(cmt.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-stone-200 leading-relaxed mt-0.5">{cmt.commentText}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Input Box */}
              <form
                onSubmit={handlePostComment}
                className="flex items-center gap-2 pt-2 border-t border-stone-800 shrink-0"
              >
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share a reflection or rejoice in merit..."
                  className="flex-1 bg-stone-950 border border-stone-700 text-white placeholder-stone-500 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  aria-label="Post comment"
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-md"
                >
                  <span>Post</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </section>
      )}
    </article>
  );
};

export default CampaignProofCard;
