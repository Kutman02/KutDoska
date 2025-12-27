// src/components/Breadcrumb.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const Breadcrumb = ({ items = [], showHomeIcon = false, onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  
  // Если на главной странице и нет дополнительных элементов, не показываем breadcrumb
  if (isHomePage && (!items || items.length === 0)) {
    return null;
  }

  // Формируем элементы breadcrumb
  const breadcrumbItems = [];
  
  // Добавляем "Главная" только если есть другие элементы или явно запрошена иконка
  if ((items && items.length > 0) || showHomeIcon) {
    breadcrumbItems.push({ label: 'Главная', path: '/', categoryId: null });
  }

  // Добавляем переданные элементы
  if (items && items.length > 0) {
    breadcrumbItems.push(...items);
  }

  // Если нет элементов для отображения, не показываем breadcrumb
  if (breadcrumbItems.length === 0) {
    return null;
  }

  const handleClick = (e, item) => {
    // Если есть обработчик клика, используем его
    if (onItemClick && item.categoryId !== undefined) {
      e.preventDefault();
      if (item.categoryId === null) {
        // Сброс фильтров (Главная)
        onItemClick(null);
      } else {
        // Установка категории
        onItemClick(item.categoryId);
      }
    } else if (item.path && !item.path.includes('?')) {
      // Если путь не содержит query параметров, используем обычную навигацию
      navigate(item.path);
    } else {
      // Если путь содержит query параметры, предотвращаем переход
      e.preventDefault();
    }
  };

  return (
    <nav className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-600 mb-3 md:mb-4 overflow-x-auto scrollbar-hide touch-pan-x" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-2 min-w-max">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;
          
          return (
            <li key={index} className="flex items-center">
              {!isFirst && (
                <FiChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-1 md:mx-2 text-gray-400 shrink-0" />
              )}
              
              {isFirst && showHomeIcon ? (
                // Первый элемент с иконкой дома (если явно запрошено)
                <button
                  onClick={(e) => handleClick(e, item)}
                  className="flex items-center hover:text-teal-600 active:text-teal-700 transition-colors cursor-pointer touch-manipulation active:scale-95 p-1"
                >
                  <FiHome className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              ) : isLast ? (
                // Последний элемент - не кликабельный
                <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-[200px] md:max-w-none text-xs md:text-sm">
                  {item.label}
                </span>
              ) : (
                // Промежуточные элементы - кликабельные
                <button
                  onClick={(e) => handleClick(e, item)}
                  className="hover:text-teal-600 active:text-teal-700 transition-colors truncate max-w-[120px] sm:max-w-[200px] md:max-w-none cursor-pointer text-left text-xs md:text-sm touch-manipulation active:scale-95 px-1"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

