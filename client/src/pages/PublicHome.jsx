// src/pages/PublicHome.jsx
import React from "react"; 
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import * as FeatherIcons from "react-icons/fi"; 

// Импортируем компоненты и хуки
import Breadcrumb from "../components/Breadcrumb";
import HomeSearchFilterBar from "../components/HomeSearchFilterBar"; // Новый компонент
import AdListSection from "../components/AdListSection"; // Новый компонент
import { useAppSelector } from "../store/hooks";
import useFavorites from "../hooks/useFavorites"; // Существующий хук
import useHomeAdsLogic from "../hooks/useHomeAdsLogic"; // Новый хук для данных и фильтров
import useAdActions from "../hooks/useAdActions"; // Новый хук для действий

const PublicHome = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth); 
  
  // 1. Логика и данные из хука
  const { 
    publicAds, setPublicAds, categories, subcategories, 
    selectedCategory, selectedSubcategory, loading, 
    searchQuery, setSearchQuery,
    handleCategorySelect, handleSubcategorySelect 
  } = useHomeAdsLogic(); 
  
  // 2. Логика избранного
  const { isFavorite, toggleFavorite } = useFavorites(); 
  
  // 3. Логика действий (удаление)
  const { handleDelete } = useAdActions({ setPublicAds }); 
  
  // --- Состояния Загрузки ---
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <FeatherIcons.FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
      </div>
    );
  }
  
  // --- Вычисление данных для рендеринга ---
  
  // Breadcrumbs
  const breadcrumbItems = [];
  if (selectedCategory) {
    const category = categories.find(c => c._id === selectedCategory);
    if (category) breadcrumbItems.push({ label: category.name, path: `/?category=${selectedCategory}` });
    
    if (selectedSubcategory) {
      const subcategory = subcategories.find(s => s._id === selectedSubcategory);
      if (subcategory) breadcrumbItems.push({ label: subcategory.name, path: `/?...` });
    }
  }

  // Имя текущей категории для отображения в строке поиска
  const currentCategoryName = categories.find(c => c._id === selectedCategory)?.name || "Все категории";

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        <div className="max-w-screen-xl mx-auto py-8">
          
          <Breadcrumb items={breadcrumbItems} />
          
          <HomeSearchFilterBar
              categories={categories}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
              currentCategoryName={currentCategoryName}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
          />

          <AdListSection
              publicAds={publicAds}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              categories={categories}
              subcategories={subcategories}
              handleCategorySelect={handleCategorySelect} // Используется для сброса фильтра
              user={user}
              navigate={navigate}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              handleDelete={handleDelete}
              searchQuery={searchQuery}
              onSearchClear={() => setSearchQuery("")}
          />
          
        </div>
      </div>
    </>
  );
};

export default PublicHome;