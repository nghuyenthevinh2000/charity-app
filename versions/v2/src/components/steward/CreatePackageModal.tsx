import React, { useState } from 'react';
import { Package, X, Plus, Image as ImageIcon } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { PackageCategory } from '../../types';

export interface CreatePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_PRESETS: Array<{ label: string; value: PackageCategory; gradient: string; defaultImg: string }> = [
  {
    label: 'Winter Relief',
    value: 'winter',
    gradient: 'from-amber-700 via-orange-600 to-amber-900',
    defaultImg: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Education & Study',
    value: 'education',
    gradient: 'from-sky-700 via-blue-600 to-indigo-900',
    defaultImg: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Medical & Health',
    value: 'medical',
    gradient: 'from-emerald-700 via-teal-600 to-emerald-900',
    defaultImg: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Food & Nutrition',
    value: 'food',
    gradient: 'from-yellow-700 via-amber-600 to-orange-900',
    defaultImg: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Emergency Aid',
    value: 'emergency',
    gradient: 'from-rose-700 via-red-600 to-amber-900',
    defaultImg: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=900&auto=format&fit=crop&q=80',
  },
];

export const CreatePackageModal: React.FC<CreatePackageModalProps> = ({ isOpen, onClose }) => {
  const { createPackage } = useMonasteryStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PackageCategory>('food');
  const [unitPrice, setUnitPrice] = useState('25');
  const [targetUnits, setTargetUnits] = useState('100');
  const [itemsIncluded, setItemsIncluded] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a package title.');
      return;
    }

    const priceNum = Number(unitPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please provide a valid unit price greater than 0.');
      return;
    }

    const unitsNum = Number(targetUnits);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      setError('Please provide a target units quota greater than 0.');
      return;
    }

    const categoryPreset = CATEGORY_PRESETS.find((c) => c.value === category);
    const resolvedImage = coverImageUrl.trim() || categoryPreset?.defaultImg || CATEGORY_PRESETS[0].defaultImg;
    const resolvedGradient = categoryPreset?.gradient || 'from-amber-700 via-orange-600 to-amber-900';

    const items = itemsIncluded
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    createPackage({
      title: title.trim(),
      category,
      unitPrice: priceNum,
      targetUnits: unitsNum,
      itemsIncluded: items.length > 0 ? items : ['Essential Relief Goods'],
      description: description.trim() || `Compassionate relief supplies for community members in need.`,
      coverImageUrl: resolvedImage,
      bannerGradient: resolvedGradient,
      createdByMonk: 'Ven. Thich Tam An',
    });

    // Reset and close
    setTitle('');
    setUnitPrice('25');
    setTargetUnits('100');
    setItemsIncluded('');
    setDescription('');
    setCoverImageUrl('');
    setError('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-package-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 text-stone-100 rounded-2xl shadow-2xl p-5 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-package-title" className="text-lg font-serif font-bold text-white">
                Create New Charity Package
              </h2>
              <p className="text-xs text-stone-400">
                Define tangible aid kits, set quota, and publish to Sanctuary Devotees
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
          {/* Package Title */}
          <div>
            <label htmlFor="package-title" className="block text-stone-300 font-medium mb-1">
              Package Title <span className="text-amber-400">*</span>
            </label>
            <input
              id="package-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Flood Relief Rice & Water Purifiers"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 text-xs"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label htmlFor="package-category" className="block text-stone-300 font-medium mb-1">
              Category
            </label>
            <select
              id="package-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PackageCategory)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-hidden focus:border-amber-500 text-xs"
            >
              {CATEGORY_PRESETS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} ({cat.value})
                </option>
              ))}
            </select>
          </div>

          {/* Unit Price & Target Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="unit-price" className="block text-stone-300 font-medium mb-1">
                Unit Price ($) <span className="text-amber-400">*</span>
              </label>
              <input
                id="unit-price"
                type="number"
                min="1"
                step="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="25"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-hidden focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label htmlFor="target-units" className="block text-stone-300 font-medium mb-1">
                Target Units <span className="text-amber-400">*</span>
              </label>
              <input
                id="target-units"
                type="number"
                min="1"
                step="1"
                value={targetUnits}
                onChange={(e) => setTargetUnits(e.target.value)}
                placeholder="100"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 focus:outline-hidden focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Included Items */}
          <div>
            <label htmlFor="items-included" className="block text-stone-300 font-medium mb-1">
              Items Included (comma-separated)
            </label>
            <input
              id="items-included"
              type="text"
              value={itemsIncluded}
              onChange={(e) => setItemsIncluded(e.target.value)}
              placeholder="e.g. 10kg Jasmine Rice, Thermal Blanket, First Aid Kit"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="package-description" className="block text-stone-300 font-medium mb-1">
              Description
            </label>
            <textarea
              id="package-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the humanitarian need and beneficiaries of this package..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 text-xs resize-none"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label htmlFor="cover-image-url" className="block text-stone-300 font-medium mb-1">
              Cover Image URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                id="cover-image-url"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-500 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  const preset = CATEGORY_PRESETS.find((c) => c.value === category);
                  if (preset) setCoverImageUrl(preset.defaultImg);
                }}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium text-xs flex items-center gap-1 transition-colors shrink-0"
                title="Use preset image for category"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Preset</span>
              </button>
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Package</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
