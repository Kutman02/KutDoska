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
      {/* Кнопка открытия фильтров - адаптивная */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-lg font-semibold text-sm md:text-base transition-all touch-manipulation active:scale-95
          ${hasActiveFilters 
            ? 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-md' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
          }`}
      >
        <FiFilter className="w-4 h-4 md:w-5 md:h-5" />
        <span className="hidden sm:inline">Фильтры</span>
        {hasActiveFilters && (
          <span className="ml-1 bg-white text-teal-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            !
          </span>
        )}
      </button>

      {/* Панель фильтров - адаптивная для мобильных */}
      {isOpen && (
        <>
          {/* Overlay для мобильных - затемняет фон */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed md:absolute inset-x-0 md:right-0 md:inset-x-auto bottom-0 md:top-full md:bottom-auto md:mt-2 w-full md:w-80 max-h-[80vh] md:max-h-none bg-white border-t md:border border-gray-200 rounded-t-3xl md:rounded-lg shadow-2xl md:shadow-xl z-50 p-4 md:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">Фильтры</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 active:scale-95 transition-all touch-manipulation p-1"
            >
              <FiX className="w-5 h-5 md:w-6 md:h-5" />
            </button>
          </div>

          <div className="space-y-4 md:space-y-5">
            {/* Город */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 md:w-5 md:h-5 text-teal-500" />
                Город
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-3 md:py-2.5 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 text-base md:text-sm transition duration-200 touch-manipulation"
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
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 md:w-5 md:h-5 text-teal-500" />
                Цена от (KGS)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.priceFrom}
                onChange={(e) => setFilters({ ...filters, priceFrom: e.target.value })}
                className="w-full px-4 py-3 md:py-2.5 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 text-base md:text-sm transition duration-200"
              />
            </div>

            {/* Цена до */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 md:w-5 md:h-5 text-teal-500" />
                Цена до (KGS)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Без ограничений"
                value={filters.priceTo}
                onChange={(e) => setFilters({ ...filters, priceTo: e.target.value })}
                className="w-full px-4 py-3 md:py-2.5 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 text-base md:text-sm transition duration-200"
              />
            </div>
          </div>

          {/* Кнопки действий - адаптивные */}
          <div className="flex gap-3 mt-6 md:mt-8 sticky bottom-0 bg-white pt-4 pb-2 md:pb-0 md:static">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-3 md:py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-base md:text-sm
                       hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation active:scale-95"
            >
              Сбросить
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 md:py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-base md:text-sm
                       hover:bg-teal-700 active:bg-teal-800 transition-colors touch-manipulation active:scale-95 shadow-md"
            >
              Применить
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;

