// src/components/NoteCard.jsx
import { FiEdit, FiTrash2, FiMapPin, FiCalendar } from "react-icons/fi"; 

const NoteCard = ({ title, snippet, date, image, onEdit, onDelete, onCardClick }) => {
  // Заглушка изображения для стиля "товара"
  const defaultImage = "https://images.unsplash.com/photo-1574540866046-21d96078347f?fit=crop&w=400&q=80";
  
  // Имитация локации (для стиля объявления)
  const location = "г. Бишкек"; 

  return (
    <div
      // Стиль карточки: чистый фон, небольшая тень, гибкий контейнер
      onClick={onCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                 border border-gray-100 dark:border-gray-700 overflow-hidden 
                 transition-all duration-200 ease-in-out
                 hover:shadow-xl hover:border-blue-500 cursor-pointer 
                 h-full flex flex-col" 
    >
      
      {/* 🖼️ 1. Блок Изображений (Основное 4x4 + остальные) */}
      <div className="relative w-full aspect-square"> 
         <img
          src={image ? image : defaultImage}
          alt="Main product photo"
          // Главное изображение: занимает весь квадрат 4x4
          className="w-full h-full object-cover" 
        />
        
        {/* 📸 Имитация галереи (миниатюры в правом нижнем углу) */}
        <div className="absolute bottom-2 right-2 flex gap-1">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 border border-white rounded-sm opacity-75"></div>
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 border border-white rounded-sm opacity-75"></div>
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 border border-white rounded-sm flex items-center justify-center text-xs text-gray-800 font-bold">
                +3
            </div>
        </div>
      </div>
      {/* --- */}
           {/* 🏷️ 3. Заголовок/Цена - В САМОМ НИЗУ */}
      <div className="bg-gray-100 dark:bg-gray-700 p-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
          {title || "Название объявления"}
        </h2>

        {/* 🛠️ Кнопки действий (Справа внизу) */}
        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {/* Кнопка ИЗМЕНИТЬ */}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full transition"
              >
                <FiEdit title="Редактировать" className="w-4 h-4" />
              </button>
            )}
            {/* Кнопка УДАЛИТЬ */}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-500 hover:text-red-700 p-1 rounded-full transition"
              >
                <FiTrash2 title="Удалить" className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📝 2. Основное описание (Сниппет и Метаданные) */}
      <div className="p-4 flex-grow flex flex-col">
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3 flex-grow">
          {snippet || "Краткое описание товара/услуги..."}
        </p>

        {/* 📍 Метаданные (Локация и Дата) */}
        <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <span className="flex items-center gap-1">
            <FiMapPin className="w-3.5 h-3.5 text-blue-500" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <FiCalendar className="w-3.5 h-3.5" />
            {date}
          </span>
        </div>
      </div>

 
    </div>
  );
};

export default NoteCard;