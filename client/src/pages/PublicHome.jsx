// src/pages/PublicHome.jsx
import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import * as FeatherIcons from "react-icons/fi"; 
import toast from "react-hot-toast";

// Импортируем компоненты и хуки
import Breadcrumb from "../components/Breadcrumb";
import HomeSearchFilterBar from "../components/HomeSearchFilterBar";
import AdListSection from "../components/AdListSection";
import FilterPanel from "../components/FilterPanel";
import { useAppSelector } from "../store/hooks";
import useFavorites from "../hooks/useFavorites";
import useHomeAdsLogic from "../hooks/useHomeAdsLogic";
import useAdActions from "../hooks/useAdActions";

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
  
  // 4. Фильтры (город, цена)
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    priceFrom: '',
    priceTo: '',
  });

  // Загрузка локаций
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/locations");
        if (!response.ok) throw new Error("Не удалось загрузить локации.");
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Ошибка:", error);
      }
    };
    fetchLocations();
  }, []);

  // Обновление объявлений с учетом фильтров (переопределяем загрузку из хука)
  useEffect(() => {
    const fetchPublicAds = async () => {
      setPublicAds([]);

      try {
        const params = new URLSearchParams();

        // Фильтр по категории/подкатегории
        if (selectedSubcategory) {
          params.append('subcategory', selectedSubcategory);
        } else if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        // Фильтры по городу и цене
        if (filters.city) {
          params.append('location', filters.city);
        }

        if (filters.priceFrom) {
          params.append('minPrice', filters.priceFrom);
        }

        if (filters.priceTo) {
          params.append('maxPrice', filters.priceTo);
        }

        if (searchQuery && searchQuery.trim().length > 0) {
          params.append('q', searchQuery.trim());
          const queryString = params.toString();
          const url = `http://localhost:8080/api/ads/search?${queryString}`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Ошибка поиска: ${response.status}`);
          
          const data = await response.json();
          setPublicAds(data || []);
        } else {
          const queryString = params.toString();
          const url = `http://localhost:8080/api/ads/latest${queryString ? `?${queryString}` : ''}`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
          
          const data = await response.json();
          setPublicAds(data || []);
        }
      } catch (error) {
        console.error("Ошибка:", error);
        toast.error(error.message);
        setPublicAds([]);
      }
    };

    fetchPublicAds();
  }, [selectedCategory, selectedSubcategory, searchQuery, filters, setPublicAds]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      priceFrom: '',
      priceTo: '',
    });
  };
  
  // --- Состояния Загрузки ---
  const isInitialLoad = loading && publicAds.length === 0;
  
  if (isInitialLoad) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <FeatherIcons.FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-600">Загрузка объявлений...</p>
      </div>
    );
  }
  
  // --- Вычисление данных для рендеринга ---
  
  // Breadcrumbs
  const breadcrumbItems = [];
  if (selectedCategory) {
    const category = categories.find(c => c._id === selectedCategory);
    if (category) breadcrumbItems.push({ 
      label: category.name, 
      path: '/', 
      categoryId: selectedCategory 
    });
    
    if (selectedSubcategory) {
      const subcategory = subcategories.find(s => s._id === selectedSubcategory);
      if (subcategory) breadcrumbItems.push({ 
        label: subcategory.name, 
        path: '/', 
        categoryId: selectedCategory,
        subcategoryId: selectedSubcategory 
      });
    }
  }

  // Обработчик клика по breadcrumb
  const handleBreadcrumbClick = (categoryId) => {
    if (categoryId === null) {
      // Сброс всех фильтров
      handleCategorySelect(null);
    } else {
      // Установка категории
      handleCategorySelect(categoryId);
    }
  };

  // Имя текущей категории для отображения в строке поиска
  const currentCategoryName = categories.find(c => c._id === selectedCategory)?.name || "Все категории";

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        <div className="max-w-screen-xl mx-auto py-8">
          
          <Breadcrumb items={breadcrumbItems} onItemClick={handleBreadcrumbClick} />
          
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <HomeSearchFilterBar
                categories={categories}
                onCategorySelect={handleCategorySelect}
                onSubcategorySelect={handleSubcategorySelect}
                currentCategoryName={currentCategoryName}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <FilterPanel
              locations={locations}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              initialFilters={filters}
            />
          </div>

          {/* Показываем индикатор загрузки при поиске */}
          {loading && publicAds.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-20">
              <FeatherIcons.FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
              <p className="text-gray-600">Поиск объявлений...</p>
            </div>
          )}
          
          <AdListSection
              publicAds={publicAds}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              categories={categories}
              subcategories={subcategories}
              handleCategorySelect={handleCategorySelect}
              user={user}
              navigate={navigate}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              handleDelete={handleDelete}
              searchQuery={searchQuery}
              onSearchClear={() => setSearchQuery("")}
              loading={loading}
          />
          
        </div>
      </div>
    </>
  );
};

export default PublicHome;