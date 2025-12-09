// src/components/SearchBar.jsx
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ query, setQuery }) => {
  return (
    // 💡 Измененный контейнер: более широкие отступы
    <div className="mb-8 p-2 rounded-xl bg-gray-50 dark:bg-gray-900 shadow-inner">
      <div className="relative max-w-lg mx-auto">
        
        {/* Иконка поиска */}
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        
        <input
          type="text"
          placeholder="Найти по названию или тексту..." // Измененный текст-заглушка
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          
          // 💡 Измененный стиль: Нет рамки, только нижняя граница. Полная ширина.
          className="w-full pl-10 pr-4 py-3 
                     bg-transparent 
                     text-gray-900 dark:text-gray-100 
                     border-0 border-b-2 border-gray-400 dark:border-gray-600 
                     focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 
                     text-base placeholder-gray-500 dark:placeholder-gray-500
                     transition duration-200"
        />
      </div>
    </div>
  );
};

export default SearchBar;