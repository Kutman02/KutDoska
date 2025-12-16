// src/components/HomeSearchFilterBar.jsx

import React from 'react';
import CategoryDropdown from './CategoryDropdown'; // Убедитесь, что путь правильный

/**
 * Компонент панели поиска и фильтрации.
 * Инкапсулирует поисковую строку и выпадающее меню категорий.
 * * @param {object} props 
 * @param {Array} props.categories - Список всех категорий.
 * @param {string} props.currentCategoryName - Имя текущей выбранной категории.
 * @param {function} props.onCategorySelect - Обработчик выбора категории.
 * @param {function} props.onSubcategorySelect - Обработчик выбора подкатегории.
 */
const HomeSearchFilterBar = ({ 
    categories, 
    currentCategoryName, 
    onCategorySelect, 
    onSubcategorySelect 
}) => {
    
    // Допустим, здесь будет обработчик текстового поиска, когда он будет реализован
    const handleSearch = () => {
        console.log("Выполнить текстовый поиск...");
        // Здесь будет логика для отправки запроса с поисковым текстом
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
                    
                    <input 
                        type="text" 
                        placeholder="Я ищу..." 
                        className="flex-grow p-3 focus:outline-none h-full"
                    />
                    <button 
                        onClick={handleSearch}
                        className="bg-teal-600 text-white px-8 h-full rounded-r-lg font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Поиск
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeSearchFilterBar;