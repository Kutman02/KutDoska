// src/components/AdCard.jsx

import React from 'react';
// Добавляем FiUser для отображения владельца (если нужно, хотя тут не используется)
import { FiEdit, FiTrash2, FiHeart } from 'react-icons/fi'; 
import { FaRegUserCircle } from 'react-icons/fa';

// Вспомогательная функция для очистки HTML
const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const AdCard = ({ 
  adId, // ID объявления для работы с избранным
  title, 
  image, 
  price, 
  onCardClick, 
  onEdit, 
  onDelete,
  // ПРОПСЫ ДЛЯ ИЗБРАННОГО
  isFavorite, 
  onToggleFavorite,
  // Информация об авторе
  author,
  onAuthorClick,
  // Категория
  categoryName
}) => {

  // Функция форматирования цены
  const formatPrice = (p) => {
    if (p === undefined || p === null || p === 0) return "Договорная";
    // Форматируем число с пробелами и добавляем KGS
    return new Intl.NumberFormat('ru-RU', { 
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(p) + ' KGS';
  };
  
  // Простая проверка, чтобы определить, владелец ли пользователь (для отображения кнопок)
  const isOwner = onEdit !== null || onDelete !== null;

  return (
    // Карточка - адаптивная для всех устройств
    <div 
      className="bg-white rounded-xl md:rounded-lg shadow-md hover:shadow-xl active:shadow-lg transition-all duration-300 
                 cursor-pointer flex flex-col relative border border-gray-100 touch-manipulation active:scale-[0.98]"
    >
      {/* 1. ИЗОБРАЖЕНИЕ - адаптивная высота */}
      <div 
        onClick={onCardClick}
        className="w-full h-40 sm:h-44 md:h-36 lg:h-40 overflow-hidden rounded-t-xl md:rounded-t-lg relative bg-gray-100"
      >
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition duration-300 hover:scale-[1.05] active:scale-100" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs md:text-sm">
            Нет фото
          </div>
        )}
      </div>

      {/* 2. КОНТЕНТ - адаптивные отступы */}
      <div className="p-3 md:p-3 flex flex-col grow">
        
        {/* Цена (первая) - адаптивный размер */}
        <p className="text-base md:text-base font-extrabold text-gray-900 mb-1">
          {formatPrice(price)}
        </p>

        {/* Категория (вторая) - адаптивный размер */}
        {categoryName && (
          <p className="text-xs md:text-xs text-gray-600 mb-1.5">
            {categoryName}
          </p>
        )}

        {/* Описание (третья) - адаптивный размер */}
        <div 
          onClick={onCardClick}
          className="text-sm md:text-sm font-semibold text-gray-800 mb-2 md:mb-2 line-clamp-2 hover:text-teal-600 active:text-teal-700 transition cursor-pointer"
        >
          {stripHtml(title || "").substring(0, 100) || ""}
        </div>

        {/* Профиль и избранное (внизу) - адаптивные размеры */}
        <div className="flex items-center justify-between pt-2 md:pt-2 border-t border-gray-100 mt-auto">
          {/* Картинка профиля (кликабельная) - адаптивный размер */}
          {author && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick && onAuthorClick(author._id);
              }}
              className="cursor-pointer hover:opacity-80 active:opacity-70 transition touch-manipulation active:scale-95"
            >
              {author.profileImageUrl ? (
                <img 
                  src={author.profileImageUrl} 
                  alt={author.displayName || author.name}
                  className="w-8 h-8 md:w-8 md:h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                  <FaRegUserCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                </div>
              )}
            </button>
          )}
          
          {/* Кнопка избранного (справа) - адаптивный размер для touch */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(adId);
            }}
            className={`p-2 md:p-1.5 rounded-full transition-all touch-manipulation active:scale-90
                       ${isFavorite 
                          ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500 active:bg-gray-300'
                       }`}
            title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <FiHeart className="w-4 h-4 md:w-4 md:h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Кнопки действий владельца - адаптивные для touch */}
        {isOwner && (
          <div className="flex justify-end gap-2 md:gap-2 mt-2 pt-2 border-t border-gray-100">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 md:p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 active:bg-gray-200 active:scale-95 transition touch-manipulation"
                title="Редактировать"
              >
                <FiEdit className="w-4 h-4 md:w-4 md:h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 md:p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-600 active:bg-gray-200 active:scale-95 transition touch-manipulation"
                title="Удалить"
              >
                <FiTrash2 className="w-4 h-4 md:w-4 md:h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdCard;