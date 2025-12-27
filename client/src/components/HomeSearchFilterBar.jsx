// src/components/HomeSearchFilterBar.jsx

import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import CategoryDropdown from './CategoryDropdown';

/**
 * Компонент панели поиска и фильтрации.
 * Инкапсулирует поисковую строку и выпадающее меню категорий.
 * * @param {object} props 
 * @param {Array} props.categories - Список всех категорий.
 * @param {string} props.currentCategoryName - Имя текущей выбранной категории.
 * @param {function} props.onCategorySelect - Обработчик выбора категории.
 * @param {function} props.onSubcategorySelect - Обработчик выбора подкатегории.
 * @param {string} props.searchQuery - Текущий поисковый запрос.
 * @param {function} props.onSearchChange - Обработчик изменения поискового запроса.
 */
const HomeSearchFilterBar = ({ 
    categories, 
    currentCategoryName, 
    onCategorySelect, 
    onSubcategorySelect,
    searchQuery = "",
    onSearchChange
}) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // Синхронизация с внешним состоянием
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearchChange) {
            onSearchChange(localQuery);
        }
    };

    const handleClear = () => {
        setLocalQuery("");
        if (onSearchChange) {
            onSearchChange("");
        }
    };

    return (
        <div className="flex mb-8 relative"> 
            
            {/* 1. Левый блок: Выпадающее меню */}
            <div className="w-1/4 min-w-[250px] mr-4 relative">
                <CategoryDropdown
                    categories={categories}
                    onCategorySelect={onCategorySelect}
                    onSubcategorySelect={onSubcategorySelect}
                />
            </div>

            {/* 2. Правый блок: Поиск */}
            <div className="flex-grow">
                {/* Поисковая строка */}
                <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm h-[50px]">
                    {/* Показываем выбранную категорию */}
                    <div className="hidden sm:flex items-center px-4 border-r text-gray-700 font-semibold whitespace-nowrap bg-gray-50 h-full rounded-l-lg">
                       {currentCategoryName}
                    </div>
                    
                    <div className="flex-grow flex items-center relative">
                        <FiSearch className="absolute left-3 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Я ищу..." 
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="flex-grow pl-10 pr-8 py-2 focus:outline-none h-full"
                        />
                        {localQuery && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={handleSearch}
                        className="bg-teal-600 text-white px-8 h-full rounded-r-lg font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                        <FiSearch className="w-5 h-5" />
                        Поиск
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeSearchFilterBar;