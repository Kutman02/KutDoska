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
  views
}) => {

  // Функция форматирования цены
  const formatPrice = (p) => {
    if (p === undefined || p === null || p === 0) return "Договорная";
    // Используем KGS (Кыргызский сом) как валюту
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'KGS', 
      minimumFractionDigits: 0 
    }).format(p);
  };
  
  // Простая проверка, чтобы определить, владелец ли пользователь (для отображения кнопок)
  const isOwner = onEdit !== null || onDelete !== null;

  return (
    // Карточка в стиле Lalafo: компактная, белая, с небольшой тенью, скругленные края.
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 
                 cursor-pointer flex flex-col relative border border-gray-100"
    >
      {/* 1. ИЗОБРАЖЕНИЕ (С метками и избранным) */}
      <div 
        onClick={onCardClick}
        // Уменьшаем высоту изображения для компактности
        className="w-full h-36 overflow-hidden rounded-t-lg relative bg-gray-100"
      >
        {/* Кнопка "Избранное" в стиле Lalafo (белая полупрозрачная) */}
        {/* Используем adId и onToggleFavorite */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Останавливаем onCardClick
            onToggleFavorite && onToggleFavorite(adId);
          }}
          className={`absolute top-2 right-2 z-10 p-1 rounded-full shadow transition-colors
                     ${isFavorite 
                        ? 'bg-red-500 text-white hover:bg-red-600' // Если в избранном
                        : 'bg-white/70 text-gray-700/80 hover:bg-white hover:text-red-500' // Если не в избранном
                     }`}
          title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          {/* Заполняем сердце, если оно в избранном */}
          <FiHeart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

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

      {/* 2. КОНТЕНТ (Уменьшенные отступы p-3) */}
      <div className="p-3 flex flex-col grow">
        
        {/* Цена (крупная, жирная, первая) */}
        <p className="text-base font-extrabold text-gray-900 mb-1">
          {formatPrice(price)}
        </p>

        {/* Описание (Компактное, с ограничением по строкам) */}
        <div 
          onClick={onCardClick}
          className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-teal-600 transition"
        >
          {stripHtml(title || "").substring(0, 100) || ""}
        </div>

        {/* Мета-информация (Локация, Дата, Просмотры - маленьким шрифтом) */}
        <div className="flex items-center text-xs text-gray-500 mt-auto pt-1">
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
        
        {/* Информация об авторе */}
        {author && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onAuthorClick && onAuthorClick(author._id);
            }}
            className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 transition"
          >
            {author.profileImageUrl ? (
              <img 
                src={author.profileImageUrl} 
                alt={author.displayName || author.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <FaRegUserCircle className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <span className="text-xs text-gray-600 truncate flex-1">
              {author.displayName || author.name}
            </span>
          </div>
        )}
        
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