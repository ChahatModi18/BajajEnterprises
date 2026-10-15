import React from 'react';
import { RotateCcw, Filter, Check } from 'lucide-react';
import { Brand, Category } from '../../types';

interface FilterSidebarProps {
  brands: Brand[];
  categories: Category[];
  selectedBrandId?: number;
  selectedCategorySlug?: string;
  minPrice?: string;
  maxPrice?: string;
  selectedWheelSize?: string;
  selectedGearCount?: string;
  availability?: string;
  onBrandChange: (brandId?: number) => void;
  onCategoryChange: (categorySlug?: string) => void;
  onPriceChange: (min?: string, max?: string) => void;
  onWheelSizeChange: (wheelSize?: string) => void;
  onGearCountChange: (gearCount?: string) => void;
  onAvailabilityChange: (status?: string) => void;
  onClearAll: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  brands,
  categories,
  selectedBrandId,
  selectedCategorySlug,
  minPrice = '',
  maxPrice = '',
  selectedWheelSize = '',
  selectedGearCount = '',
  availability = '',
  onBrandChange,
  onCategoryChange,
  onPriceChange,
  onWheelSizeChange,
  onGearCountChange,
  onAvailabilityChange,
  onClearAll,
}) => {
  const wheelSizes = ['20 inches', '24 inches', '26 inches', '27.5 inches', '29 inches', '700C'];
  const gearOptions = ['Single Speed', '7 Speed', '18 Speed', '21 Speed', '24 Speed'];

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 text-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Brands Filter */}
      <div>
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
          Bicycle Brands
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs hover:text-emerald-700">
            <input
              type="radio"
              name="brand_filter"
              checked={!selectedBrandId}
              onChange={() => onBrandChange(undefined)}
              className="text-emerald-600 focus:ring-emerald-500 rounded"
            />
            <span>All Brands</span>
          </label>
          {brands.map((b) => (
            <label key={b.id} className="flex items-center gap-2 cursor-pointer text-xs hover:text-emerald-700">
              <input
                type="radio"
                name="brand_filter"
                checked={selectedBrandId === b.id}
                onChange={() => onBrandChange(b.id)}
                className="text-emerald-600 focus:ring-emerald-500 rounded"
              />
              <span className={b.name === 'AVON' || b.name === 'HERCULES' ? 'font-bold' : ''}>
                {b.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
          Categories
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs hover:text-emerald-700">
            <input
              type="radio"
              name="cat_filter"
              checked={!selectedCategorySlug}
              onChange={() => onCategoryChange(undefined)}
              className="text-emerald-600 focus:ring-emerald-500 rounded"
            />
            <span>All Categories</span>
          </label>
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer text-xs hover:text-emerald-700">
              <input
                type="radio"
                name="cat_filter"
                checked={selectedCategorySlug === c.slug}
                onChange={() => onCategoryChange(c.slug)}
                className="text-emerald-600 focus:ring-emerald-500 rounded"
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => onPriceChange(e.target.value, maxPrice)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => onPriceChange(minPrice, e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Wheel Size */}
      <div>
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
          Wheel Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {wheelSizes.map((ws) => (
            <button
              key={ws}
              onClick={() => onWheelSizeChange(selectedWheelSize === ws ? undefined : ws)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                selectedWheelSize === ws
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {ws}
            </button>
          ))}
        </div>
      </div>

      {/* Gear Count */}
      <div>
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
          Gear Type
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {gearOptions.map((g) => (
            <button
              key={g}
              onClick={() => onGearCountChange(selectedGearCount === g ? undefined : g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                selectedGearCount === g
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div>
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
          Availability
        </h4>
        <select
          value={availability}
          onChange={(e) => onAvailabilityChange(e.target.value || undefined)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Stock Statuses</option>
          <option value="IN_STOCK">In Stock Only</option>
          <option value="ON_ENQUIRY">On Enquiry</option>
        </select>
      </div>
    </aside>
  );
};
