// src/components/AdListSection.jsx

import React from 'react';
import * as FeatherIcons from "react-icons/fi"; 
import AdCard from "./AdCard"; // Убедитесь, что путь правильный

// Вспомогательная функция, которая была в PublicHome
const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

/**
 * Компонент для отображения списка объявлений и управления заголовком ленты.
 * * @param {object} props
 * @param {Array} props.publicAds - Массив объявлений для отображения.
 * @param {string|null} props.selectedCategory - ID выбранной категории.
 * @param {string|null} props.selectedSubcategory - ID выбранной подкатегории.
 * @param {Array} props.categories - Список всех категорий.
 * @param {Array} props.subcategories - Список подкатегорий текущей категории.
 * @param {function} props.handleCategorySelect - Обработчик сброса фильтров.
 * @param {object} props.user - Объект текущего пользователя для проверки владельца.
 * @param {function} props.navigate - Функция навигации.
 * @param {function} props.isFavorite - Функция проверки избранного.
 * @param {function} props.toggleFavorite - Функция переключения избранного.
 * @param {function} props.handleDelete - Функция удаления объявления.
 * @param {string} props.searchQuery - Текущий поисковый запрос.
 * @param {function} props.onSearchClear - Обработчик сброса поиска.
 * @param {boolean} props.loading - Состояние загрузки.
 */
const AdListSection = ({ 
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
          ? subcategories.find(s => s._id === selectedSubcategory)?.name
          : selectedCategory 
            ? categories.find(c => c._id === selectedCategory)?.name
            : "Новые объявления";

    return (
        <>
            {/* Заголовок текущей ленты - адаптивный */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 md:mb-6 border-b pb-2 md:pb-3 gap-2 sm:gap-0">
                <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
                        {currentTitle}
                    </h2>
                    {publicAds.length > 0 && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
                      className="text-teal-600 hover:text-teal-800 active:text-teal-900 text-xs sm:text-sm font-medium mb-1 touch-manipulation active:scale-95 transition-all self-start sm:self-auto"
                    >
                        Сбросить фильтры
                    </button>
                )}
            </div>
            
            {/* Пустое состояние - адаптивное */}
            {!loading && publicAds.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
                   <FeatherIcons.FiInbox className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-3 md:mb-4" />
                   <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">
                       {searchQuery && searchQuery.trim() 
                           ? `По запросу "${searchQuery}" ничего не найдено`
                           : "Объявлений пока нет"}
                   </h3>
                   <p className="text-sm md:text-base text-gray-500 max-w-md">
                       {searchQuery && searchQuery.trim()
                           ? "Попробуйте изменить поисковый запрос или выбрать другую категорию"
                           : "Попробуйте выбрать другую категорию"}
                   </p>
               </div>
            ) : !loading ? (
              /* Сетка объявлений - адаптивная для всех устройств */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {publicAds.map((ad) => {
                      // Логика проверки владельца перенесена сюда
                      const isOwner = user?._id && (user._id === (ad.user?._id || ad.user)); 
                      
                      return (
                          <AdCard
                          key={ad._id}
                          adId={ad._id} 
                          title={ad.content || ad.title || ""}
                          image={ad.images?.[0] || ad.imageUrl} 
                          descriptionSnippet={stripHtml(ad.content)?.slice(0, 100)} 
                          tags={ad.tags || []}
                          price={ad.price}
                          categoryName={ad.subcategory?.name || ad.category?.name || ""} 
                          onCardClick={() => navigate(`/ad-view/${ad._id}`)} 
                          onEdit={isOwner ? () => navigate(`/edit-ad/${ad._id}`) : null}
                          onDelete={isOwner ? () => handleDelete(ad._id) : null} 
                          isFavorite={isFavorite(ad._id)}
                          onToggleFavorite={toggleFavorite}
                          author={ad.user}
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