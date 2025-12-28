// src/components/AdListSection.tsx

import React from 'react';
import * as FeatherIcons from "react-icons/fi"; 
import AdCard from "./AdCard";
import type { Ad } from "../types/ad.types";
import type { Category } from "../types/category.types";
import type { User } from "../types/user.types";

// Вспомогательная функция, которая была в PublicHome
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

interface AdListSectionProps {
    publicAds: Ad[];
    selectedCategory: string | null;
    selectedSubcategory: string | null;
    categories: Category[];
    subcategories: Category[];
    handleCategorySelect: (category: Category | null) => void;
    user: User | null;
    navigate: (path: string) => void;
    isFavorite: (adId: string) => boolean;
    toggleFavorite: (adId: string) => void;
    handleDelete: (adId: string) => void;
    searchQuery?: string;
    onSearchClear?: () => void;
    loading?: boolean;
}

const AdListSection: React.FC<AdListSectionProps> = ({ 
    publicAds, 
    selectedCategory, 
    selectedSubcategory, 
    categories, 
    subcategories, 
    handleCategorySelect, 
    user, 
    navigate, 
    isFavorite,
    toggleFavorite,
    handleDelete,
    searchQuery = "",
    onSearchClear,
    loading = false
}) => {

    // Вычисление заголовка текущей ленты
    const currentTitle = searchQuery && searchQuery.trim()
        ? `Результаты поиска: "${searchQuery}"`
        : selectedSubcategory 
          ? subcategories.find((s: Category) => s._id === selectedSubcategory)?.name
          : selectedCategory 
            ? categories.find((c: Category) => c._id === selectedCategory)?.name
            : "Новые объявления";

    return (
        <>
            {/* Заголовок текущей ленты - адаптивный */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 md:mb-6 border-b border-gray-200 dark:border-slate-700 pb-2 md:pb-3 gap-2 sm:gap-0">
                <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-500 dark:text-slate-400">
                        {currentTitle}
                    </h2>
                    {publicAds.length > 0 && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Найдено объявлений: {publicAds.length}
                        </p>
                    )}
                </div>
                {/* Кнопка сброса фильтра - адаптивная */}
                {(selectedCategory || selectedSubcategory || (searchQuery && searchQuery.trim())) && (
                    <button 
                      onClick={() => {
                        handleCategorySelect(null);
                        if (onSearchClear) onSearchClear();
                      }}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 active:text-teal-900 dark:active:text-teal-200 text-xs sm:text-sm font-medium mb-1 touch-manipulation active:scale-95 transition-all self-start sm:self-auto"
                    >
                        Сбросить фильтры
                    </button>
                )}
            </div>
            
            {/* Пустое состояние - адаптивное */}
            {!loading && publicAds.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
                   <FeatherIcons.FiInbox className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-slate-600 mb-3 md:mb-4" />
                   <h3 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-slate-300 mb-2">
                       {searchQuery && searchQuery.trim() 
                           ? `По запросу "${searchQuery}" ничего не найдено`
                           : "Объявлений пока нет"}
                   </h3>
                   <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 max-w-md">
                       {searchQuery && searchQuery.trim()
                           ? "Попробуйте изменить поисковый запрос или выбрать другую категорию"
                           : "Попробуйте выбрать другую категорию"}
                   </p>
               </div>
            ) : !loading ? (
              /* Сетка объявлений: 2 на мобильных, 6 на больших ПК, адаптивно на маленьких ПК */
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                  {publicAds.map((ad: Ad) => {
                      // Логика проверки владельца перенесена сюда
                      const adUserId = typeof ad.user === 'object' && ad.user !== null ? ad.user._id : ad.user;
                      const isOwner = user?._id && (user._id === adUserId); 
                      
                      // Получаем название категории
                      const categoryName = typeof ad.subcategory === 'object' && ad.subcategory !== null 
                        ? ad.subcategory.name 
                        : typeof ad.category === 'object' && ad.category !== null 
                          ? ad.category.name 
                          : "";
                      
                      // Получаем автора как объект User
                      const author = typeof ad.user === 'object' && ad.user !== null ? ad.user : undefined;
                      
                      return (
                          <AdCard
                          key={ad._id}
                          adId={ad._id} 
                          title={ad.content || ad.title || ""}
                          image={ad.images?.[0] || ad.imageUrl} 
                          descriptionSnippet={stripHtml(ad.content)?.slice(0, 100)} 
                          tags={ad.tags || []}
                          price={ad.price}
                          categoryName={categoryName} 
                          onCardClick={() => navigate(`/ad-view/${ad._id}`)} 
                          onEdit={isOwner ? () => navigate(`/edit-ad/${ad._id}`) : null}
                          onDelete={isOwner ? () => handleDelete(ad._id) : null} 
                          isFavorite={isFavorite(ad._id)}
                          onToggleFavorite={toggleFavorite}
                          author={author}
                          onAuthorClick={(userId) => navigate(`/user/${userId}`)}
                          />
                      );
                  })}
              </div>
            ) : null}
        </>
    );
};

export default AdListSection;