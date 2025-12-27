// src/components/FilterPanel.jsx
import React, { useState } from 'react';
import { FiFilter, FiX, FiMapPin, FiDollarSign } from 'react-icons/fi';

const FilterPanel = ({ 
  locations = [], 
  onApplyFilters, 
  onClearFilters,
  initialFilters = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    city: initialFilters.city || '',
    priceFrom: initialFilters.priceFrom || '',
    priceTo: initialFilters.priceTo || '',
  });

  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      city: '',
      priceFrom: '',
      priceTo: '',
    };
    setFilters(clearedFilters);
    onClearFilters();
    setIsOpen(false);
  };

  const hasActiveFilters = filters.city || filters.priceFrom || filters.priceTo;

  return (
    <div className="relative">
      {/* Кнопка открытия фильтров */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors
          ${hasActiveFilters 
            ? 'bg-teal-600 text-white hover:bg-teal-700' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
      >
        <FiFilter className="w-5 h-5" />
        Фильтры
        {hasActiveFilters && (
          <span className="ml-1 bg-white text-teal-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            !
          </span>
        )}
      </button>

      {/* Панель фильтров */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Фильтры</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Город */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-teal-500" />
                Город
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 transition duration-200"
              >
                <option value="">Все города</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Цена от */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-teal-500" />
                Цена от (KGS)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.priceFrom}
                onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 transition duration-200"
              />
            </div>

            {/* Цена до */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-teal-500" />
                Цена до (KGS)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Без ограничений"
                value={filters.priceTo}
                onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                className="w-full px-4 py-2 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 transition duration-200"
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold 
                       hover:bg-gray-200 transition-colors"
            >
              Сбросить
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-semibold 
                       hover:bg-teal-700 transition-colors"
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

