import React from 'react';
import { FiEdit, FiTrash2, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';

const AdCard = ({ 
  title, 
  image, 
  descriptionSnippet, 
  datePosted, 
  tags, 
  price, 
  location, 
  onCardClick, 
  onEdit, 
  onDelete 
}) => {

  const formatPrice = (p) => {
    if (p === undefined || p === null) return "Цена не указана";
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'KGS', 
      minimumFractionDigits: 0 
    }).format(p);
  };

  return (
    // Карточка Soft UI: сильное скругление, белый фон, мягкая тень, эффект ховера
    <div 
      className="bg-white rounded-3xl p-4 shadow-xl shadow-gray-300/60 transition-all duration-300 
                 hover:shadow-2xl hover:shadow-teal-300/50 hover:scale-[1.02] cursor-pointer flex flex-col"
    >
      {/* Изображение */}
      <div 
        onClick={onCardClick}
        className="w-full h-40 overflow-hidden rounded-2xl mb-4 relative bg-gray-100"
      >
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition duration-300 hover:opacity-90" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            
          </div>
        )}
      </div>

      {/* Заголовок */}
      <h3 
        onClick={onCardClick}
        className="text-xl font-bold text-gray-900 mb-2 truncate hover:text-teal-600 transition"
      >
        {title}
      </h3>

      {/* Цена */}
      <p className="flex items-center text-2xl font-extrabold text-teal-600 mb-3">
        <FiDollarSign className="w-6 h-6 mr-1" />
        {formatPrice(price)}
      </p>

      {/* Описание */}
      <p 
        onClick={onCardClick}
        className="text-gray-600 text-sm mb-4 flex-grow"
      >
        {descriptionSnippet || "Нет описания."}
      </p>
      
      {/* Мета-информация */}
      <div className="space-y-1 text-sm mb-4 border-t pt-3 border-gray-100">
          <p className="flex items-center text-gray-500">
            <FiMapPin className="w-4 h-4 mr-2 text-teal-400" />
            {location || "Не указано"}
          </p>
          <p className="flex items-center text-gray-500">
            <FiCalendar className="w-4 h-4 mr-2 text-teal-400" />
            {datePosted}
          </p>
      </div>

      {/* Кнопки действий (Только если передан обработчик) */}
      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition duration-200 shadow-md shadow-blue-100/50"
              title="Редактировать объявление"
            >
              <FiEdit className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition duration-200 shadow-md shadow-red-100/50"
              title="Удалить объявление"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdCard;