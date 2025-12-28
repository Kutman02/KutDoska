// src/components/AdCard.tsx

import React from 'react';
import { FiEdit, FiTrash2, FiHeart } from 'react-icons/fi'; 
import { FaRegUserCircle } from 'react-icons/fa';
import type { User } from '../types/user.types';

// Вспомогательная функция для очистки HTML
const stripHtml = (html: unknown): string => {
  if (!html) return "";
  // Если это уже чистый текст (нет HTML тегов), возвращаем как есть
  if (typeof html !== 'string') return String(html);
  // Удаляем все HTML теги с помощью регулярного выражения
  const text = html.replace(/<[^>]*>/g, '');
  // Декодируем HTML entities
  const tmp = document.createElement("div");
  tmp.innerHTML = text;
  return tmp.textContent || tmp.innerText || text;
};

interface AdCardProps {
  adId: string;
  title: string;
  image?: string | null;
  price?: number | null;
  onCardClick: () => void;
  onEdit?: (() => void) | null;
  onDelete?: (() => void) | null;
  isFavorite?: boolean;
  onToggleFavorite?: (adId: string) => void;
  author?: User & { profileImageUrl?: string; displayName?: string };
  onAuthorClick?: (userId: string) => void;
  categoryName?: string;
  descriptionSnippet?: string;
  datePosted?: string;
  location?: string;
  tags?: string[];
  views?: number;
}

const AdCard: React.FC<AdCardProps> = ({ 
  adId,
  title, 
  image, 
  price, 
  onCardClick, 
  onEdit, 
  onDelete,
  isFavorite, 
  onToggleFavorite,
  author,
  onAuthorClick,
  categoryName
}) => {

  // Функция форматирования цены
  const formatPrice = (p: number | null | undefined): string => {
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
    // Карточка - минималистичный дизайн, без лишних стилей
    <div 
      className="bg-white dark:bg-slate-800 rounded-md overflow-hidden cursor-pointer flex flex-col relative 
                 touch-manipulation active:scale-[0.98] transition-all duration-200 border border-gray-200 dark:border-slate-700
                 w-full h-full min-h-[280px] md:min-h-[320px] hover:shadow-md dark:hover:shadow-slate-900/50"
    >
      {/* 1. ИЗОБРАЖЕНИЕ - фиксированная высота, не теряет пропорции */}
      <div 
        onClick={onCardClick}
        className="w-full h-32 sm:h-36 md:h-40 lg:h-44 shrink-0 overflow-hidden relative bg-gray-100 dark:bg-slate-700"
      >
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition duration-300 hover:scale-[1.05] active:scale-100" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-xs md:text-sm">
            Нет фото
          </div>
        )}
      </div>

      {/* 2. КОНТЕНТ - фиксированные отступы, растягивается */}
      <div className="p-2.5 sm:p-3 flex flex-col grow min-h-0">
        
        {/* Цена (первая) - фиксированный размер */}
        <p className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-teal-400 mb-1 line-clamp-1">
          {formatPrice(price)}
        </p>

        {/* Категория (вторая) - фиксированный размер */}
        {categoryName && (
          <p className="text-xs text-gray-500 dark:text-slate-500 italic mb-1 line-clamp-1">
            {categoryName}
          </p>
        )}

        {/* Описание (третья) - фиксированный размер, растягивается */}
        <div 
          onClick={onCardClick}
          className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200 mb-2 line-clamp-2 grow hover:text-teal-600 dark:hover:text-teal-400 active:text-teal-700 dark:active:text-teal-500 transition-colors cursor-pointer"
        >
          {stripHtml(title || "").substring(0, 100) || ""}
        </div>

        {/* Профиль и избранное (внизу) - адаптивные размеры */}
        <div className="flex items-center justify-between pt-2 md:pt-2 border-t border-gray-200 dark:border-slate-700 mt-auto">
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
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                  <FaRegUserCircle className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                </div>
              )}
            </button>
          )}
          
          {/* Кнопка избранного (справа) - минималистичный стиль */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(adId);
            }}
            className={`p-2 transition-colors touch-manipulation active:scale-90
                       ${isFavorite 
                          ? 'text-red-500 dark:text-red-400' 
                          : 'text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400'
                       }`}
            title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <FiHeart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Кнопки действий владельца - минималистичный стиль */}
        {isOwner && (
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-colors touch-manipulation"
                title="Редактировать"
              >
                <FiEdit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-colors touch-manipulation"
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