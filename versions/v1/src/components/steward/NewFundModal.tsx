import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { FundCategory } from '../../types';

export interface NewFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (fundId: string) => void;
}

const CATEGORIES: { id: FundCategory; labelEn: string; labelVi: string; icon: string; color: string }[] = [
  { id: 'infrastructure', labelEn: 'Infrastructure & Solar', labelVi: 'Cơ Sở & Năng Lượng', icon: 'SunMedium', color: '#D97706' },
  { id: 'necessities', labelEn: 'Alms & Food', labelVi: 'Trai Tăng & Ẩm Thực', icon: 'UtensilsCrossed', color: '#B45309' },
  { id: 'healthcare', labelEn: 'Medicine & Care', labelVi: 'Y Dược & Chăm Sóc', icon: 'HeartPulse', color: '#059669' },
  { id: 'operations', labelEn: 'Operations', labelVi: 'Vận Hành Tu Viện', icon: 'Building2', color: '#7C3AED' },
  { id: 'special-drive', labelEn: 'Special Drive', labelVi: 'Phật Sự Đặc Biệt', icon: 'Sparkles', color: '#DC2626' },
];

export const NewFundModal: React.FC<NewFundModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { launchNewFund } = useMonasteryStore();
  const { t, language } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState<FundCategory>('infrastructure');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [isAbbotVerified, setIsAbbotVerified] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập tên quỹ' : 'Please enter a cause name');
      return;
    }

    const numericTarget = parseFloat(targetAmount);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      setError(language === 'vi' ? 'Vui lòng nhập mục tiêu quyên góp hợp lệ' : 'Please enter a valid target goal amount');
      return;
    }

    const selectedCategoryConfig = CATEGORIES.find((c) => c.id === category);

    const newFund = launchNewFund({
      name: name.trim(),
      description: description.trim() || (language === 'vi' ? 'Phật sự cúng dường tu viện' : 'Monastery charitable initiative'),
      category,
      targetAmount: numericTarget,
      deadline,
      icon: selectedCategoryConfig?.icon || 'Sparkles',
      color: selectedCategoryConfig?.color || '#D97706',
    });

    // Reset fields
    setName('');
    setDescription('');
    setTargetAmount('');
    setError(null);

    if (onSuccess) onSuccess(newFund.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-fund-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-parchment-300 relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-parchment-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-saffron-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="new-fund-modal-title" className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {t('steward.newFundTitle') || 'Launch New Cause Fund'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {language === 'vi' ? 'Khởi tạo chiến dịch mới hiển thị ngay tại Tịnh Xá' : 'Instantly spins off onto Sanctuary Home tab'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form noValidate onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cause Name */}
          <div>
            <label htmlFor="fund-name" className="block text-xs font-semibold text-stone-700 mb-1">
              {t('steward.causeName') || 'Cause Name'} <span className="text-rose-500">*</span>
            </label>
            <input
              id="fund-name"
              type="text"
              placeholder={t('steward.newFundNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 font-medium text-stone-900"
              required
            />
          </div>

          {/* Target Amount & Deadline Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="fund-target" className="block text-xs font-semibold text-stone-700 mb-1">
                {t('steward.targetGoal') || 'Target Goal ($)'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">$</span>
                <input
                  id="fund-target"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="3000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 font-medium text-stone-900"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="fund-deadline" className="block text-xs font-semibold text-stone-700 mb-1">
                {t('steward.deadlineDate') || 'Deadline Date'}
              </label>
              <input
                id="fund-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 font-medium text-stone-900"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t('steward.categoryLabel') || 'Category'}
            </label>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Category Selection">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-saffron-600 text-white shadow-2xs'
                        : 'bg-parchment-100 hover:bg-parchment-200 text-stone-700 border border-parchment-300'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    <span>{language === 'vi' ? cat.labelVi : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spiritual Purpose / Description */}
          <div>
            <label htmlFor="fund-description" className="block text-xs font-semibold text-stone-700 mb-1">
              {t('steward.spiritualPurpose') || 'Spiritual Purpose / Description'}
            </label>
            <textarea
              id="fund-description"
              rows={3}
              placeholder={t('steward.newFundDescPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 text-stone-900"
            />
          </div>

          {/* Abbot Verification Toggle */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <ShieldCheck className="w-5 h-5 text-saffron-700 shrink-0" />
              <div className="min-w-0 flex-1">
                <label htmlFor="fund-verified" className="text-xs font-semibold text-stone-800 cursor-pointer block leading-tight">
                  {t('steward.verifiedByAbbot') || 'Verified by Abbot ✓'}
                </label>
                <p className="text-[10px] text-stone-500 leading-tight mt-0.5 truncate">
                  {language === 'vi' ? 'Chứng nhận chính thức từ Viện Chủ Tu Viện' : 'Attested by Abbot Thich Tam Duc'}
                </p>
              </div>
            </div>
            <input
              id="fund-verified"
              type="checkbox"
              checked={isAbbotVerified}
              onChange={(e) => setIsAbbotVerified(e.target.checked)}
              className="w-4 h-4 accent-saffron-600 rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-parchment-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-sm transition-colors"
            >
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-medium text-sm transition-colors shadow-xs"
            >
              {t('steward.createButton') || 'Launch Fund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFundModal;
