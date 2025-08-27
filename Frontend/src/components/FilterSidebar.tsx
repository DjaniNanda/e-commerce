import React from 'react';
import { Filter, X } from 'lucide-react';
import { Category } from '../types';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    category: string;
    priceRange: [number, number];
  };
  onFilterChange: (filters: any) => void;
  categories: Category[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFilterChange,
  categories
}) => {
  if (!isOpen) return null;

  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({ ...filters, priceRange: [min, max] });
  };

  const clearFilters = () => {
    onFilterChange({
      category: '',
      priceRange: [0, 1000000]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:relative lg:bg-transparent">
      <div className="bg-white h-full w-80 overflow-y-auto lg:border-r">
        <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between lg:justify-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full text-sm text-blue-600 hover:text-blue-800 text-left"
          >
            Effacer tous les filtres
          </button>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Catégories</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={() => handleCategoryChange('')}
                  className="mr-2"
                />
                <span className="text-sm">Toutes les catégories</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={filters.category === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Prix (FCFA)</h4>
            <div className="space-y-2">
              {[
                { label: 'Moins de 10,000', min: 0, max: 10000 },
                { label: '10,000 - 25,000', min: 10000, max: 25000 },
                { label: '25,000 - 50,000', min: 25000, max: 50000 },
                { label: '50,000 - 100,000', min: 50000, max: 100000 },
                { label: 'Plus de 100,000', min: 100000, max: 1000000 }
              ].map((range) => (
                <label key={range.label} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange[0] === range.min && filters.priceRange[1] === range.max}
                    onChange={() => handlePriceChange(range.min, range.max)}
                    className="mr-2"
                  />
                  <span className="text-sm">{range.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;