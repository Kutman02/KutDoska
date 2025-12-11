// src/components/Breadcrumb.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const Breadcrumb = ({ items = [] }) => {
  // Всегда начинаем с главной страницы
  const breadcrumbItems = [
    { label: 'Главная', path: '/' }
  ];

  // Добавляем переданные элементы
  if (items && items.length > 0) {
    breadcrumbItems.push(...items);
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 min-w-max">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index === 0 ? (
                // Первый элемент - всегда иконка дома
                <Link
                  to={item.path}
                  className="flex items-center hover:text-teal-600 transition-colors"
                >
                  <FiHome className="w-4 h-4" />
                </Link>
              ) : (
                // Остальные элементы
                <>
                  <FiChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                  {isLast ? (
                    // Последний элемент - не кликабельный
                    <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
                      {item.label}
                    </span>
                  ) : (
                    // Промежуточные элементы - кликабельные
                    <Link
                      to={item.path}
                      className="hover:text-teal-600 transition-colors truncate max-w-[200px] sm:max-w-none"
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

