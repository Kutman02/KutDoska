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
            
            {/* Кнопка открытия */}
            <button
                onClick={toggleDropdown}
                className={`flex items-center w-full px-4 py-3 text-left font-semibold text-white rounded-lg 
                           transition-colors duration-200 shadow-md
                           ${isOpen ? 'bg-teal-800' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
                <FeatherIcons.FiGrid className="w-5 h-5 mr-3" />
                Все категории
                <FeatherIcons.FiChevronDown 
                    className={`w-4 h-4 ml-auto transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
                />
            </button>

            {/* Панель меню */}
            {isOpen && (
                <div className="absolute z-50 left-0 top-full mt-2 w-[900px] h-[500px] bg-white border border-gray-200 rounded-lg shadow-2xl flex overflow-hidden">
                    
                    {/* ЛЕВАЯ КОЛОНКА: Главные категории */}
                    <div className="w-1/3 bg-gray-50 overflow-y-auto border-r border-gray-200 custom-scrollbar">
                        <ul className="py-2">
                            {categories.map((cat) => {
                                const Icon = getIconComponent(cat.icon);
                                const isActive = hoveredCategory === cat._id;

                                return (
                                    <li 
                                        key={cat._id}
                                        // При наведении - показываем подкатегории справа
                                        onMouseEnter={() => setHoveredCategory(cat._id)}
                                        // При клике - ВЫБИРАЕМ эту категорию и закрываем меню
                                        onClick={() => handleCategoryClick(cat._id)}
                                        className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-all duration-200
                                            ${isActive 
                                                ? 'bg-white text-teal-700 font-bold border-l-4 border-teal-600 shadow-sm' 
                                                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 pointer-events-none"> 
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                                            <span>{cat.name}</span>
                                        </div>
                                        {isActive && <FeatherIcons.FiChevronRight className="w-4 h-4" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА: Подкатегории */}
                    <div className="w-2/3 p-6 bg-white overflow-y-auto">
                        {activeCategoryData ? (
                            <>
                                <div className="flex items-center justify-between mb-6 border-b pb-3">
                                    <h3 
                                        // Можно кликнуть и на заголовок справа
                                        onClick={() => handleCategoryClick(activeCategoryData._id)}
                                        className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-teal-600 transition-colors"
                                    >
                                        {activeCategoryData.name}
                                    </h3>
                                    <button 
                                        onClick={() => handleCategoryClick(activeCategoryData._id)}
                                        className="text-sm text-teal-600 hover:underline font-medium flex items-center"
                                    >
                                        Смотреть все
                                        <FeatherIcons.FiArrowRight className="ml-1 w-4 h-4" />
                                    </button>
                                </div>

                                {activeCategoryData.subcategories && activeCategoryData.subcategories.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                        {activeCategoryData.subcategories.map((sub) => (
                                            <a
                                                key={sub._id}
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleSubcategoryClick(activeCategoryData._id, sub._id);
                                                }}
                                                className="text-gray-600 hover:text-teal-600 hover:translate-x-1 transition-transform duration-200 block py-1"
                                            >
                                                {sub.name}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">Нет подкатегорий</p>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Загрузка...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryDropdown;