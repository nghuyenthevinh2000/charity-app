import React, { useState, useRef, useEffect } from 'react';
import { X, Send, HeartHandshake } from 'lucide-react';
import { DonationInput, CommunityComment } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { getPrayerDedication } from '../../utils/localization';
import { useMonasteryStore } from '../../context/MonasteryStore';

export interface PrayerDialogueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  donation: DonationInput | null;
}

export const PrayerDialogueDrawer: React.FC<PrayerDialogueDrawerProps> = ({
  isOpen,
  onClose,
  donation,
}) => {
  const { t } = useTranslation();
  const { addCommentToPrayer, isStewardUnlocked } = useMonasteryStore();

  const [messageText, setMessageText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [replyRole, setReplyRole] = useState<'devotee' | 'monk'>('devotee');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // If steward is unlocked, default to monk reply role, else devotee
      if (isStewardUnlocked) {
        setReplyRole('monk');
      } else {
        setReplyRole('devotee');
      }
    }
  }, [isOpen, isStewardUnlocked]);

  useEffect(() => {
    if (isOpen) {
      if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isOpen, donation?.prayerIntention?.comments?.length]);

  if (!isOpen || !donation || !donation.prayerIntention) {
    return null;
  }

  const prayer = donation.prayerIntention;
  const comments = prayer.comments || [];
  const isBlessed = prayer.blessingStatus === 'blessed';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const commentPayload: Partial<CommunityComment> = {
      authorRole: replyRole,
      authorName:
        replyRole === 'monk'
          ? 'Venerable Abbot Tam Duc'
          : authorName.trim() || 'Devotee',
      monkTitle: replyRole === 'monk' ? 'Venerable Abbot Tam Duc' : undefined,
      commentText: trimmed,
      createdAt: new Date().toISOString(),
    };

    addCommentToPrayer(donation.id, commentPayload);
    setMessageText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogue-drawer-title"
    >
      <div
        className="w-full max-w-md max-h-[90vh] bg-parchment-50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-parchment-300 animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="p-4 bg-white border-b border-parchment-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-900">
              <HeartHandshake className="w-5 h-5 text-saffron-700" />
            </span>
            <div>
              <h2
                id="dialogue-drawer-title"
                className="text-sm sm:text-base font-serif font-bold text-stone-900"
              >
                Sangha Community Dialogue
              </h2>
              <p className="text-[11px] text-stone-500">
                Monks and devotees sharing words of Dharma and compassion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('prayerWall.closeDialogue')}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prayer Intention Brief Summary Card */}
        <div className="bg-amber-50/50 p-3.5 border-b border-amber-200/60">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-stone-900">
              {donation.donorName}
            </span>
            {isBlessed && (
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span>{t('prayerWall.blessedMorningChanting')}</span>
              </span>
            )}
          </div>
          <p className="text-xs italic font-serif text-stone-700">
            "{getPrayerDedication(prayer, t)}"
          </p>
        </div>

        {/* Scrollable Threaded Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-parchment-100/50">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-stone-500 space-y-2">
              <span className="text-3xl">🪷</span>
              <p className="text-xs sm:text-sm font-medium">
                {t('prayerWall.noRepliesTitle')}
              </p>
              <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                {t('prayerWall.noRepliesDesc')}
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isMonk = comment.authorRole === 'monk';
              return (
                <div
                  key={comment.id}
                  className={`flex flex-col ${
                    isMonk ? 'items-start' : 'items-end'
                  }`}
                >
                  {/* Badge & Role Tag */}
                  <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                    {isMonk ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-semibold inline-flex items-center gap-1 shadow-2xs">
                        <span>🧘</span>
                        <span>{comment.monkTitle || comment.authorName || 'Venerable Abbot Tam Duc'}</span>
                        <span className="text-amber-700 font-bold">✓</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700 font-medium inline-flex items-center gap-1">
                        <span>🌸</span>
                        <span>{comment.authorName || t('common.devotee')}</span>
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm shadow-2xs ${
                      isMonk
                        ? 'bg-amber-50/90 border border-amber-300 text-amber-950 rounded-tl-xs font-serif leading-relaxed'
                        : 'bg-white border border-parchment-300 text-stone-800 rounded-tr-xs leading-normal'
                    }`}
                  >
                    <p>{comment.commentText}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white border-t border-parchment-300 space-y-2"
        >
          {/* If Steward is unlocked, allow role selection */}
          {isStewardUnlocked && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">{t('prayerWall.postAs')}</span>
              <button
                type="button"
                onClick={() => setReplyRole('monk')}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors ${
                  replyRole === 'monk'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                🧘 Abbot Tam Duc ✓
              </button>
              <button
                type="button"
                onClick={() => setReplyRole('devotee')}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors ${
                  replyRole === 'devotee'
                    ? 'bg-stone-200 border-stone-400 text-stone-900 font-semibold'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                🌸 {t('common.devotee')}
              </button>
            </div>
          )}

          {replyRole === 'devotee' && (
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t('prayerWall.devoteeNamePlaceholder')}
              aria-label={t('prayerWall.devoteeNameAria')}
              className="w-full px-3 py-1 text-xs rounded-lg border border-stone-200 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-600 transition-all"
            />
          )}

          <div className="flex gap-2">
            <textarea
              rows={2}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={t('prayerWall.inputPlaceholder') || 'Write a compassionate message or question for monks...'}
              aria-label={t('prayerWall.compassionateMsgAria')}
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 transition-all resize-none"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              aria-label={t('prayerWall.send')}
              className="px-4 py-2 bg-saffron-600 hover:bg-saffron-700 disabled:bg-stone-300 text-white rounded-xl font-medium text-xs flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{t('prayerWall.send')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrayerDialogueDrawer;
