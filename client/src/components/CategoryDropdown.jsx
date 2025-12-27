import React, { useState, useEffect, useRef } from 'react';
import * as FeatherIcons from "react-icons/fi";

// Хелпер для иконок
const getIconComponent = (iconName) => {
    const IconComponentName = `Fi${iconName}`; 
    const IconComponent = FeatherIcons[IconComponentName]; 
    return IconComponent || FeatherIcons.FiZap; 
}

const CategoryDropdown = ({ categories, onCategorySelect, onSubcategorySelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(prev => !prev);

    // При открытии меню автоматически выбираем первую категорию для отображения справа
    useEffect(() => {
        if (isOpen && categories.length > 0 && !hoveredCategory) {
            setHoveredCategory(categories[0]._id);
        }
    }, [isOpen, categories]);

    // Закрытие при клике снаружи
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 1. Обработчик клика по ГЛАВНОЙ категории (вызывает фильтрацию и закрывает меню)
    const handleCategoryClick = (categoryId) => {
        onCategorySelect(categoryId, { isDropdownSelection: true });
        onSubcategorySelect(null); // Сбрасываем подкатегорию, чтобы показать ВСЕ в этой категории
        setIsOpen(false);
    };

    // 2. Обработчик клика по ПОДКАТЕГОРИИ
    const handleSubcategoryClick = (categoryId, subcategoryId) => {
        onCategorySelect(categoryId, { isDropdownSelection: true });
        onSubcategorySelect(subcategoryId);
        setIsOpen(false);
    };

    const activeCategoryData = categories.find(c => c._id === hoveredCategory);

    return (
        <div className="relative" ref={dropdownRef}>
            
            {/* Кнопка открытия - адаптивная */}
            <button
                onClick={toggleDropdown}
                className={`flex items-center w-full px-3 md:px-4 py-2.5 md:py-3 text-left font-semibold text-sm md:text-base text-white rounded-xl md:rounded-lg 
                           transition-all duration-200 shadow-md touch-manipulation active:scale-95
                           ${isOpen ? 'bg-teal-800' : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'}`}
            >
                <FeatherIcons.FiGrid className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0" />
                <span className="truncate">Все категории</span>
                <FeatherIcons.FiChevronDown 
                    className={`w-4 h-4 ml-auto flex-shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
                />
            </button>

            {/* Панель меню - адаптивная для мобильных */}
            {isOpen && (
                <>
                    {/* Overlay для мобильных */}
                    <div 
                        className="fixed inset-0 bg-black/30 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed md:absolute inset-x-0 md:left-0 md:inset-x-auto bottom-0 md:top-full md:bottom-auto md:mt-2 w-full md:w-[900px] h-[85vh] md:h-[500px] max-h-[600px] md:max-h-none bg-white border-t md:border border-gray-200 rounded-t-3xl md:rounded-lg shadow-2xl z-50 flex flex-col md:flex-row overflow-hidden">
                    
                    {/* ЛЕВАЯ КОЛОНКА: Главные категории - адаптивная */}
                    <div className="w-full md:w-1/3 bg-gray-50 overflow-y-auto border-r-0 md:border-r border-b md:border-b-0 border-gray-200 custom-scrollbar">
                        <ul className="py-2">
                            {categories.map((cat) => {
                                const Icon = getIconComponent(cat.icon);
                                const isActive = hoveredCategory === cat._id;

                                return (
                                    <li 
                                        key={cat._id}
                                        // При наведении (десктоп) или клике (мобильный) - показываем подкатегории
                                        onMouseEnter={() => setHoveredCategory(cat._id)}
                                        onClick={() => {
                                            // На мобильных при клике сразу выбираем категорию
                                            if (window.innerWidth < 768) {
                                                handleCategoryClick(cat._id);
                                            } else {
                                                setHoveredCategory(cat._id);
                                            }
                                        }}
                                        className={`flex items-center justify-between px-4 md:px-5 py-3 md:py-3 cursor-pointer transition-all duration-200 touch-manipulation active:scale-[0.98]
                                            ${isActive 
                                                ? 'bg-white text-teal-700 font-bold border-l-4 border-teal-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-100 active:bg-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 pointer-events-none"> 
                                            <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                                            <span className="text-sm md:text-base">{cat.name}</span>
                                        </div>
                                        {isActive && <FeatherIcons.FiChevronRight className="w-4 h-4 flex-shrink-0" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА: Подкатегории - адаптивная */}
                    <div className="w-full md:w-2/3 p-4 md:p-6 bg-white overflow-y-auto">
                        {activeCategoryData ? (
                            <>
                                <div className="flex items-center justify-between mb-4 md:mb-6 border-b pb-2 md:pb-3">
                                    <h3 
                                        onClick={() => handleCategoryClick(activeCategoryData._id)}
                                        className="text-lg md:text-2xl font-bold text-gray-800 cursor-pointer hover:text-teal-600 active:text-teal-700 transition-colors touch-manipulation"
                                    >
                                        {activeCategoryData.name}
                                    </h3>
                                    <button 
                                        onClick={() => handleCategoryClick(activeCategoryData._id)}
                                        className="text-xs md:text-sm text-teal-600 hover:underline active:scale-95 font-medium flex items-center gap-1 touch-manipulation"
                                    >
                                        <span className="hidden sm:inline">Смотреть все</span>
                                        <span className="sm:hidden">Все</span>
                                        <FeatherIcons.FiArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </div>

                                {activeCategoryData.subcategories && activeCategoryData.subcategories.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-3">
                                        {activeCategoryData.subcategories.map((sub) => (
                                            <button
                                                key={sub._id}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleSubcategoryClick(activeCategoryData._id, sub._id);
                                                }}
                                                className="text-left text-sm md:text-base text-gray-600 hover:text-teal-600 active:text-teal-700 hover:translate-x-1 active:scale-95 transition-all duration-200 block py-2 md:py-1 touch-manipulation"
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm md:text-base text-gray-400 italic">Нет подкатегорий</p>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <span className="text-sm md:text-base">Загрузка...</span>
                            </div>
                        )}
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default CategoryDropdown;