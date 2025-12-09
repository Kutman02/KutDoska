// src/components/Loader.jsx
import React from 'react';

// Простой компонент-заглушка для индикации загрузки
const Loader = () => {
  return (
    // Используем фиксированные стили для центрирования
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* 🌀 Индикатор загрузки (простой спиннер Tailwind CSS) */}
      <div className="flex flex-col items-center space-y-3">
        
        {/* Анимация спиннера (border-t-4 делает верхнюю границу видимой) */}
        <div 
          className="w-10 h-10 border-4 border-t-4 border-indigo-600 border-opacity-25 border-t-opacity-100 rounded-full animate-spin"
          aria-label="Загрузка данных"
        ></div>
        
        {/* Текст */}
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Загрузка...
        </p>
      </div>
      
    </div>
  );
};

export default Loader;