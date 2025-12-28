// src/components/HomeSearchFilterBar.jsx

import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import CategoryDropdown from './CategoryDropdown';
import { Category } from '../types/category.types';

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
}: {
    categories: Category[];
    currentCategoryName: string;
    onCategorySelect: (category: Category | null) => void;
    onSubcategorySelect: (subcategory: Category | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}) => {
    const [localQuery, setLocalQuery] = useState<string>(searchQuery);

    // Синхронизация с внешним состоянием
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const handleSearch = () => {
        onSearchChange(localQuery);
    };

    const handleClear = () => {
        setLocalQuery("");
        onSearchChange("");
    };

    return (
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full"> 
            
            {/* 1. Выпадающее меню категорий - полная ширина на мобильных */}
            <div className="w-full md:w-auto md:min-w-[200px] lg:min-w-[250px] relative">
                <CategoryDropdown
                    categories={categories}
                    onCategorySelect={onCategorySelect}
                    onSubcategorySelect={onSubcategorySelect}
                />
            </div>

            {/* 2. Поисковая строка - адаптивная */}
            <div className="flex-1 w-full">
                {/* Поисковая строка */}
                <div className="flex items-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md h-12 md:h-[50px] overflow-hidden">
                    {/* Показываем выбранную категорию - скрыта на мобильных */}
                    <div className="hidden lg:flex items-center px-3 md:px-4 border-r border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold text-xs md:text-sm whitespace-nowrap bg-gray-50 dark:bg-slate-700 h-full">
                       {currentCategoryName}
                    </div>
                    
                    <div className="grow flex items-center relative">
                        <FiSearch className="absolute left-3 md:left-4 text-gray-400 dark:text-slate-500 w-4 h-4 md:w-5 md:h-5" />
                        <input 
                            type="text" 
                            placeholder="Я ищу..." 
                            value={localQuery}
                            onChange={(e) => setLocalQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="grow pl-9 md:pl-10 pr-7 md:pr-8 py-2 md:py-3 focus:outline-none h-full text-sm md:text-base bg-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                        />
                        {localQuery && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-2 md:right-3 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 active:scale-95 transition-colors touch-manipulation"
                            >
                                <FiX className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={handleSearch}
                        className="bg-teal-600 dark:bg-teal-500 text-white px-4 md:px-6 lg:px-8 h-full font-semibold hover:bg-teal-700 dark:hover:bg-teal-600 active:bg-teal-800 dark:active:bg-teal-700 transition-colors flex items-center justify-center gap-1 md:gap-2 touch-manipulation min-w-[60px] md:min-w-[80px] rounded-r-md"
                    >
                        <FiSearch className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">Поиск</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeSearchFilterBar;