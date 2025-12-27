// src/components/Breadcrumb.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const Breadcrumb = ({ items = [], showHomeIcon = false }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // Если на главной странице и нет дополнительных элементов, не показываем breadcrumb
  if (isHomePage && (!items || items.length === 0)) {
    return null;
  }

  // Формируем элементы breadcrumb
  const breadcrumbItems = [];
  
  // Добавляем "Главная" только если есть другие элементы или явно запрошена иконка
  if ((items && items.length > 0) || showHomeIcon) {
    breadcrumbItems.push({ label: 'Главная', path: '/' });
  }

  // Добавляем переданные элементы
  if (items && items.length > 0) {
    breadcrumbItems.push(...items);
  }

  // Если нет элементов для отображения, не показываем breadcrumb
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 min-w-max">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;
          
          return (
            <li key={index} className="flex items-center">
              {!isFirst && (
                <FiChevronRight className="w-4 h-4 mx-2 text-gray-400 shrink-0" />
              )}
              
              {isFirst && showHomeIcon ? (
                // Первый элемент с иконкой дома (если явно запрошено)
                <Link
                  to={item.path}
                  className="flex items-center hover:text-teal-600 transition-colors"
                >
                  <FiHome className="w-4 h-4" />
                </Link>
              ) : isLast ? (
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
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

