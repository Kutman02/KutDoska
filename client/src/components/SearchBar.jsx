// src/components/SearchBar.jsx
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ query, setQuery }) => {
  return (
    // 1. Контейнер: Светлый фон, сильное скругление, мягкая тень (Soft UI)
    <div className="mb-8 p-3 rounded-2xl bg-white shadow-lg shadow-gray-200">
      <div className="relative max-w-lg mx-auto">
        
        {/* Иконка поиска */}
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
        
        <input
          type="text"
          placeholder="Найти объявления, товары или услуги..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          
          // 2. Стиль поля ввода:
          //    - Увеличен padding (py-3, pl-12)
          //    - Легкий светло-серый фон для эффекта "утопления"
          //    - Скругленные углы и отсутствие границ
          //    - Фокус: мягкое кольцо акцентного цвета
          className="w-full pl-12 pr-6 py-3 
                     bg-gray-100 
                     text-gray-800
                     border border-transparent 
                     rounded-xl /* Скругленные углы */
                     focus:outline-none 
                     focus:ring-2 focus:ring-teal-400 focus:bg-white /* Фокус с кольцом */
                     text-base placeholder-gray-500
                     transition duration-200 shadow-inner" 
        />
      </div>
    </div>
  );
};

export default SearchBar;