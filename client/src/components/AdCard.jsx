// src/components/AdCard.jsx

import React from 'react';
// Добавляем FiUser для отображения владельца (если нужно, хотя тут не используется)
import { FiEdit, FiTrash2, FiMapPin, FiHeart, FiUser, FiEye } from 'react-icons/fi'; 
import { FaRegUserCircle } from 'react-icons/fa';

// Вспомогательная функция для очистки HTML
const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const AdCard = ({ 
  adId, // НОВЫЙ ПРОПС: ID объявления для работы с избранным
  title, 
  image, 
  datePosted, 
  price, 
  location, 
  onCardClick, 
  onEdit, 
  onDelete,
  // НОВЫЕ ПРОПСЫ ДЛЯ ИЗБРАННОГО
  isFavorite, 
  onToggleFavorite,
  // Информация об авторе
  author,
  onAuthorClick,
  // Количество просмотров
  views,
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
    // Карточка в стиле Lalafo: компактная, белая, с небольшой тенью, скругленные края.
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 
                 cursor-pointer flex flex-col relative border border-gray-100"
    >
      {/* 1. ИЗОБРАЖЕНИЕ */}
      <div 
        onClick={onCardClick}
        className="w-full h-36 overflow-hidden rounded-t-lg relative bg-gray-100"
      >
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition duration-300 hover:scale-[1.05]" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Нет фото
          </div>
        )}
      </div>

      {/* 2. КОНТЕНТ */}
      <div className="p-3 flex flex-col grow">
        
        {/* Цена (первая) */}
        <p className="text-base font-extrabold text-gray-900 mb-1">
          {formatPrice(price)}
        </p>

        {/* Категория (вторая) */}
        {categoryName && (
          <p className="text-xs text-gray-600 mb-1">
            {categoryName}
          </p>
        )}

        {/* Описание (третья) */}
        <div 
          onClick={onCardClick}
          className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-teal-600 transition"
        >
          {stripHtml(title || "").substring(0, 100) || ""}
        </div>

        {/* Мета-информация (Локация, Просмотры, Дата) */}
        <div className="flex items-center text-xs text-gray-500 mt-auto pt-1 mb-2">
            <FiMapPin className="w-3 h-3 mr-1 shrink-0" />
            <span className="truncate">{location || "Не указано"}</span>
            <span className="ml-auto flex items-center gap-1">
              {views !== undefined && views > 0 && (
                <>
                  <FiEye className="w-3 h-3" />
                  <span>{views}</span>
                  <span>·</span>
                </>
              )}
              <span>{datePosted}</span>
            </span>
        </div>
        
        {/* Профиль и избранное (внизу) */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Картинка профиля (кликабельная) */}
          {author && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick && onAuthorClick(author._id);
              }}
              className="cursor-pointer hover:opacity-80 transition"
            >
              {author.profileImageUrl ? (
                <img 
                  src={author.profileImageUrl} 
                  alt={author.displayName || author.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                  <FaRegUserCircle className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          )}
          
          {/* Кнопка избранного (справа) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(adId);
            }}
            className={`p-1.5 rounded-full transition-colors
                       ${isFavorite 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'
                       }`}
            title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <FiHeart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Кнопки действий владельца */}
        {isOwner && (
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition"
                title="Редактировать"
              >
                <FiEdit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-600 transition"
                title="Удалить"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdCard;