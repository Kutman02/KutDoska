import React from 'react';
import { FiEdit, FiTrash2, FiMapPin, FiHeart } from 'react-icons/fi';
// FiCalendar и FiDollarSign не нужны, так как мы используем обычный текст для даты и символы
// В Lalafo часто используются значки PRO/VIP, но мы добавим только Фи избранное.

const AdCard = ({ 
  title, 
  image, 
  // descriptionSnippet удален для компактности
  datePosted, 
  // tags удален
  price, 
  location, 
  onCardClick, 
  onEdit, 
  onDelete 
}) => {

  // Функция форматирования цены
  const formatPrice = (p) => {
    if (p === undefined || p === null) return "Договорная";
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
        <button className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/70 hover:bg-white text-gray-700/80 hover:text-red-500 transition-colors shadow">
          <FiHeart className="w-5 h-5" />
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
      <div className="p-3 flex flex-col flex-grow">
        
        {/* Цена (крупная, жирная, первая) */}
        <p className="text-base font-extrabold text-gray-900 mb-1">
          {formatPrice(price)}
        </p>

        {/* Заголовок (Компактный, с ограничением по строкам) */}
        <h3 
          onClick={onCardClick}
          className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-teal-600 transition"
        >
          {title}
        </h3>

        {/* Мета-информация (Локация и Дата - маленьким шрифтом) */}
        <div className="flex items-center text-xs text-gray-500 mt-auto pt-1">
            <FiMapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{location || "Не указано"}</span>
            <span className="ml-auto">· {datePosted}</span>
        </div>
        
        {/* Кнопки действий владельца (Если нужно, можно сделать иконками) */}
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