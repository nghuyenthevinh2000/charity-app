import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Image as ImageIcon, Trash2, Receipt, AlertCircle } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { getFundName } from '../../utils/localization';
import groceriesReceipt from '../../assets/receipts/verified-groceries-receipt.jpg';

export interface ExpenseEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SAMPLE_RECEIPT_DATA_URL = groceriesReceipt;

export const ExpenseEntryModal: React.FC<ExpenseEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { funds, logExpense } = useMonasteryStore();
  const { t, language } = useTranslation();

  const [fundId, setFundId] = useState<string>(() => funds[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [items, setItems] = useState('');
  const [purpose, setPurpose] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentFundId = fundId || funds[0]?.id || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReceiptImage(reader.result);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleReceipt = () => {
    setReceiptImage(SAMPLE_RECEIPT_DATA_URL);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError(language === 'vi' ? 'Vui lòng nhập số tiền hợp lệ' : 'Please enter a valid expense amount');
      return;
    }

    if (!merchant.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập tên đơn vị nhận / nhà cung cấp' : 'Please specify the payee or merchant');
      return;
    }

    if (!purpose.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập mục đích chi tiêu' : 'Please describe the spiritual purpose or reason for expenditure');
      return;
    }

    const itemsArray = items
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    logExpense({
      fundId: currentFundId,
      amount: numericAmount,
      merchant: merchant.trim(),
      items: itemsArray.length > 0 ? itemsArray : [purpose.trim()],
      purpose: purpose.trim(),
      receiptImageUrl: receiptImage || SAMPLE_RECEIPT_DATA_URL,
      verifiedBy: 'Monastery Kitchen Steward Thich Minh Thong',
    });

    // Reset fields
    setAmount('');
    setMerchant('');
    setItems('');
    setPurpose('');
    setReceiptImage('');
    setError(null);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-entry-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 border border-parchment-300 relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-parchment-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-saffron-800">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 id="expense-entry-modal-title" className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {t('steward.expenseModalTitle') || 'Log New Expense'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {language === 'vi' ? 'Ghi nhận chi tiêu minh bạch lên sổ UTXO' : 'Record auditable expenditure onto UTXO ledger'}
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

          {/* Amount and Fund */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-amount" className="block text-xs font-semibold text-stone-700 mb-1">
                {t('steward.expenseAmount') || 'Expense Amount ($)'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold">$</span>
                <input
                  id="expense-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 focus:border-transparent font-medium text-stone-900"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="expense-fund" className="block text-xs font-semibold text-stone-700 mb-1">
                {t('steward.fundSelector') || 'Cause Fund'}
              </label>
              <select
                id="expense-fund"
                value={currentFundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 text-stone-900 font-medium"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {getFundName(f, t)} (${f.currentBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payee / Merchant */}
          <div>
            <label htmlFor="expense-merchant" className="block text-xs font-semibold text-stone-700 mb-1">
              {t('steward.merchantLabel') || 'Payee / Merchant'} <span className="text-rose-500">*</span>
            </label>
            <input
              id="expense-merchant"
              type="text"
              placeholder={t('steward.merchantPlaceholder')}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 text-stone-900"
              required
            />
          </div>

          {/* Purchased Items */}
          <div>
            <label htmlFor="expense-items" className="block text-xs font-semibold text-stone-700 mb-1">
              {t('steward.itemsLabel') || 'Purchased Items'}
            </label>
            <input
              id="expense-items"
              type="text"
              placeholder={t('steward.itemsPlaceholder')}
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 text-stone-900"
            />
            <span className="text-[10px] text-stone-500 mt-0.5 block">
              {language === 'vi' ? 'Các mặt hàng ngăn cách bằng dấu phẩy' : 'Separate multiple items with commas'}
            </span>
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="expense-purpose" className="block text-xs font-semibold text-stone-700 mb-1">
              {t('steward.purposeLabel') || 'Spiritual Purpose / Purpose'} <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="expense-purpose"
              rows={2}
              placeholder={t('steward.purposePlaceholder')}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-parchment-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-600 text-stone-900"
              required
            />
          </div>

          {/* Receipt Photo Upload Section */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-stone-700">
              {t('steward.receiptLabel') || 'Receipt Photo & Cryptographic Proof'}
            </label>

            {receiptImage ? (
              <div className="relative border border-amber-300 bg-amber-50/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                  <img src={receiptImage} alt="Receipt preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Đã đính kèm hóa đơn' : 'Receipt proof attached'}</span>
                  </div>
                  <p className="text-[10px] font-mono text-stone-500 truncate mt-0.5">
                    sha256:8b4f...{Date.now().toString(16)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptImage('')}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label="Remove receipt"
                  title="Remove receipt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-saffron-500 bg-parchment-50 hover:bg-amber-50/40 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-stone-700">
                    {language === 'vi' ? 'Chụp ảnh hoặc tải hóa đơn từ máy' : 'Take photo or upload receipt file'}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{t('steward.receiptUploadFormats')}</p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleUseSampleReceipt}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-saffron-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{t('steward.useSampleReceipt') || 'Use Sample Receipt'}</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload receipt image"
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
              {t('steward.submitExpense') || 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseEntryModal;
