import React, { useState } from 'react';
import { X, Heart, Sparkles, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { DonationInput, IntentionCategory } from '../../types';
import { getFundName } from '../../utils/localization';
import { BlessingCertificate } from './BlessingCertificate';

export interface OfferingModalProps {
  selectedFundId: string | null;
  onClose: () => void;
  onNavigateToLedger?: (txHash: string) => void;
  onNavigateToPrayerWall?: () => void;
}

const PRESET_AMOUNTS = [15, 35, 70, 150];

export const OfferingModal: React.FC<OfferingModalProps> = ({
  selectedFundId,
  onClose,
  onNavigateToLedger,
  onNavigateToPrayerWall,
}) => {
  const { getFund, addDonation } = useMonasteryStore();
  const { t, language } = useTranslation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(35);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  // Step 2 Form State
  const [donorName, setDonorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [category, setCategory] = useState<IntentionCategory>('peace');
  const [dedicationText, setDedicationText] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Step 3 Result State
  const [completedDonation, setCompletedDonation] = useState<DonationInput | null>(null);

  if (!selectedFundId) return null;

  const fund = getFund(selectedFundId);
  if (!fund) return null;

  const currentAmount = customAmount.trim() !== '' ? Number(customAmount) : (selectedPreset || 0);

  const handleSelectPreset = (val: number) => {
    setSelectedPreset(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setSelectedPreset(null);
  };

  const handleNextToStep2 = () => {
    if (currentAmount > 0) {
      setStep(2);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleSubmitOffering = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentAmount <= 0) return;

    const donation = addDonation({
      fundId: fund.id,
      amount: currentAmount,
      donorName: isAnonymous ? 'Anonymous Devotee' : (donorName.trim() || 'Devotee'),
      isAnonymous,
      prayerIntention: dedicationText.trim()
        ? {
            category,
            dedicationText: dedicationText.trim(),
            isPublic,
          }
        : undefined,
    });

    setCompletedDonation(donation);
    setStep(3);
  };

  const handleModalClose = () => {
    // Reset state
    setStep(1);
    setSelectedPreset(35);
    setCustomAmount('');
    setDonorName('');
    setIsAnonymous(false);
    setCategory('peace');
    setDedicationText('');
    setIsPublic(true);
    setCompletedDonation(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offering-modal-title"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-parchment-300 relative my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full transition-colors cursor-pointer"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & 3-Step Breadcrumbs */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-saffron-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-saffron-600" />
              {getFundName(fund, t)}
            </span>
          </div>

          <h2 id="offering-modal-title" className="text-lg sm:text-xl font-serif font-bold text-stone-900">
            {step === 3 ? t('offeringModal.step3') : t('offeringModal.title')}
          </h2>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs font-medium text-stone-500">
            <span
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-colors ${
                step === 1
                  ? 'bg-saffron-600 text-white font-semibold shadow-2xs'
                  : 'bg-parchment-200 text-stone-700'
              }`}
            >
              1. {t('offeringModal.step1Short')}
            </span>
            <span className="text-stone-300">→</span>
            <span
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-colors ${
                step === 2
                  ? 'bg-saffron-600 text-white font-semibold shadow-2xs'
                  : 'bg-parchment-200 text-stone-700'
              }`}
            >
              2. {t('offeringModal.step2Short')}
            </span>
            <span className="text-stone-300">→</span>
            <span
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-colors ${
                step === 3
                  ? 'bg-saffron-600 text-white font-semibold shadow-2xs'
                  : 'bg-parchment-200 text-stone-700'
              }`}
            >
              3. {t('offeringModal.step3Short')}
            </span>
          </div>
        </div>

        {/* STEP 1: CAUSE & AMOUNT */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Frequency switch (One-time vs Monthly recurring) */}
            <div className="flex bg-parchment-100 p-1 rounded-xl border border-parchment-300 text-xs font-medium">
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !isRecurring
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('offeringModal.frequencyOneTime')}
              </button>
              <button
                type="button"
                onClick={() => setIsRecurring(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isRecurring
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('offeringModal.frequencyMonthly')}
              </button>
            </div>

            {/* Amount Selection Section */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                {t('offeringModal.amountLabel')}
              </label>

              {/* Preset Chips */}
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((val) => {
                  const isSelected = selectedPreset === val && customAmount === '';
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectPreset(val)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border-amber-600 ring-2 ring-amber-400 font-extrabold shadow-sm'
                          : 'bg-parchment-50 border-stone-300 text-stone-800 hover:bg-parchment-100'
                      }`}
                    >
                      <span>${val}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="pt-2">
                <label
                  htmlFor="custom-amount-input"
                  className="block text-xs font-medium text-stone-600 mb-1"
                >
                  {t('offeringModal.customAmount')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-semibold text-sm">
                    $
                  </span>
                  <input
                    id="custom-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder={t('offeringModal.customAmountPlaceholder') || '108'}
                    aria-label={t('offeringModal.customAmount')}
                    className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Fund Transparency Assurance */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900">
              <ShieldCheck className="w-4 h-4 text-saffron-700 shrink-0" />
              <span>
                {language === 'vi'
                  ? 'Mọi khoản cúng dường đều được truy xuất nguồn gốc trên sổ cái UTXO.'
                  : '100% of your offering is cryptographically traced on our public UTXO ledger.'}
              </span>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleNextToStep2}
                disabled={currentAmount <= 0}
                className="w-full py-3 px-4 rounded-xl bg-saffron-600 hover:bg-saffron-700 active:bg-saffron-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('offeringModal.next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRAYER INTENTION & DEDICATION */}
        {step === 2 && (
          <form onSubmit={handleSubmitOffering} className="space-y-3.5">
            {/* Donor Name & Anonymous Switch */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="donor-name-input"
                  className="block text-xs font-semibold text-stone-700"
                >
                  {t('offeringModal.donorName')}
                </label>
              </div>

              <input
                id="donor-name-input"
                type="text"
                disabled={isAnonymous}
                value={isAnonymous ? '' : donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder={
                  isAnonymous
                    ? language === 'vi'
                      ? 'Phật tử ẩn danh'
                      : 'Anonymous Devotee'
                    : t('offeringModal.donorNamePlaceholder') || 'Your name or family name'
                }
                aria-label={t('offeringModal.donorName')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 disabled:bg-stone-100 disabled:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 transition-all"
              />

              <label className="flex items-center gap-2 pt-0.5 cursor-pointer text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  aria-label={t('offeringModal.donorAnonymous')}
                  className="rounded border-stone-300 text-saffron-600 focus:ring-saffron-500 cursor-pointer"
                />
                <span>{t('offeringModal.donorAnonymous')}</span>
              </label>
            </div>

            {/* Intention Category Chips */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                {t('offeringModal.intentionCategory')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'healing', label: t('offeringModal.catHealing') },
                  { id: 'memorial', label: t('offeringModal.catMemorial') },
                  { id: 'peace', label: t('offeringModal.catPeace') },
                  { id: 'gratitude', label: t('offeringModal.catGratitude') },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as IntentionCategory)}
                    className={`py-2 px-2.5 rounded-lg border text-xs text-left font-medium transition-all cursor-pointer ${
                      category === item.id
                        ? 'bg-amber-100 text-amber-950 border-amber-500 ring-1 ring-amber-400 font-semibold'
                        : 'bg-parchment-50 border-stone-200 text-stone-700 hover:bg-parchment-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dedication Textarea */}
            <div className="space-y-1">
              <label
                htmlFor="prayer-intention-input"
                className="block text-xs font-semibold text-stone-700"
              >
                {t('offeringModal.intentionText')}
              </label>
              <textarea
                id="prayer-intention-input"
                rows={3}
                value={dedicationText}
                onChange={(e) => setDedicationText(e.target.value)}
                placeholder={t('offeringModal.intentionPlaceholder')}
                aria-label={t('offeringModal.intentionText')}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 transition-all resize-none"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex bg-parchment-100 p-1 rounded-xl border border-parchment-300 text-xs font-medium">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isPublic
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('offeringModal.publicDedication')}
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !isPublic
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t('offeringModal.privateDedication')}
              </button>
            </div>

            {/* Step 2 Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBackToStep1}
                className="py-2.5 px-3.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('offeringModal.back')}</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-saffron-600 hover:bg-saffron-700 active:bg-saffron-800 text-white font-medium text-xs sm:text-sm transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white/30" />
                <span>{t('offeringModal.submit')}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DIGITAL BLESSING CERTIFICATE */}
        {step === 3 && completedDonation && (
          <BlessingCertificate
            donation={completedDonation}
            fundName={getFundName(fund, t)}
            onNavigateToLedger={onNavigateToLedger}
            onNavigateToPrayerWall={onNavigateToPrayerWall}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};

export default OfferingModal;
