// src/pages/PublicHome.tsx
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
import ConfirmModal from "../components/ConfirmModal";
import { useAppSelector } from "../store/hooks";
import useFavorites from "../hooks/useFavorites";
import useHomeAdsLogic from "../hooks/useHomeAdsLogic";
import useAdActions from "../hooks/useAdActions";
import type { Location } from "../types/location.types";
import type { PageFilters } from "../types/page.types";
import type { AdFilters } from "../types/ad.types";
import type { Category } from "../types/category.types";
import type { BreadcrumbItem } from "../types/component.types";

const PublicHome: React.FC = () => {
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
  
  // Состояние для модального окна подтверждения удаления
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    adId: string;
    adTitle: string;
  }>({
    isOpen: false,
    adId: "",
    adTitle: "",
  });
  
  const openDeleteModal = (adId: string, adTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      adId,
      adTitle,
    });
  };
  
  const handleConfirmDelete = async () => {
    await handleDelete(deleteConfirm.adId);
    setDeleteConfirm({ isOpen: false, adId: "", adTitle: "" });
  }; 
  
  // 4. Фильтры (город, цена)
  const [locations, setLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<PageFilters>({
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
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        toast.error(errorMessage);
        setPublicAds([]);
      }
    };

    fetchPublicAds();
  }, [selectedCategory, selectedSubcategory, searchQuery, filters, setPublicAds]);

  const handleApplyFilters = (newFilters: AdFilters) => {
    // Преобразуем AdFilters в PageFilters
    setFilters({
      city: newFilters.location || '',
      priceFrom: newFilters.priceFrom !== undefined ? String(newFilters.priceFrom) : '',
      priceTo: newFilters.priceTo !== undefined ? String(newFilters.priceTo) : '',
    });
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <FeatherIcons.FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-600">Загрузка объявлений...</p>
      </div>
    );
  }
  
  // --- Вычисление данных для рендеринга ---
  
  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [];
  if (selectedCategory && Array.isArray(categories)) {
    const category = (categories as Category[]).find((c: Category) => c._id === selectedCategory);
    if (category) breadcrumbItems.push({ 
      label: category.name, 
      path: '/', 
      categoryId: selectedCategory 
    });
    
    if (selectedSubcategory && Array.isArray(subcategories)) {
      const subcategory = (subcategories as Category[]).find((s: Category) => s._id === selectedSubcategory);
      if (subcategory) breadcrumbItems.push({ 
        label: subcategory.name, 
        path: '/', 
        categoryId: selectedCategory,
        subcategoryId: selectedSubcategory 
      });
    }
  }

  // Адаптеры для преобразования типов между useHomeAdsLogic и компонентами
  const handleCategorySelectAdapter = (category: Category | null) => {
    if (category === null) {
      handleCategorySelect(null);
    } else {
      handleCategorySelect(category._id);
    }
  };

  const handleSubcategorySelectAdapter = (subcategory: Category | null) => {
    if (subcategory === null) {
      handleSubcategorySelect(null);
    } else {
      handleSubcategorySelect(subcategory._id);
    }
  };

  // Обработчик клика по breadcrumb
  const handleBreadcrumbClick = (categoryId: string | null) => {
    if (categoryId === null) {
      // Сброс всех фильтров
      handleCategorySelect(null);
    } else {
      // Установка категории
      handleCategorySelect(categoryId);
    }
  };

  // Имя текущей категории для отображения в строке поиска
  const currentCategoryName = Array.isArray(categories) 
    ? (categories as Category[]).find((c: Category) => c._id === selectedCategory)?.name || "Все категории"
    : "Все категории";

  return (
    <>
      <Toaster position="top-right" />
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, adId: "", adTitle: "" })}
        onConfirm={handleConfirmDelete}
        title="Удалить объявление?"
        message={`Вы уверены, что хотите удалить объявление: "${deleteConfirm.adTitle}"? Это действие необратимо!`}
        confirmText="Удалить"
        cancelText="Отмена"
      />
      {/* Полноэкранная страница без отдельного фона */}
      <div className="min-h-screen w-full pb-20 md:pb-0">
        {/* Контейнер на всю ширину */}
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          
          {/* Breadcrumb - скрыт на мобильных, показан на планшетах и выше */}
          <div className="hidden md:block mb-4">
            <Breadcrumb items={breadcrumbItems} onItemClick={handleBreadcrumbClick} />
          </div>
          
          {/* Мобильная версия breadcrumb - компактная */}
          {breadcrumbItems.length > 0 && (
            <div className="md:hidden mb-3">
              <Breadcrumb items={breadcrumbItems} onItemClick={handleBreadcrumbClick} />
            </div>
          )}
          
          {/* Поиск и фильтры - адаптивная верстка */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3 md:gap-4">
            {/* Поисковая строка - полная ширина на мобильных */}
            <div className="w-full md:flex-1">
              <HomeSearchFilterBar
                  categories={categories}
                  onCategorySelect={handleCategorySelectAdapter}
                  onSubcategorySelect={handleSubcategorySelectAdapter}
                  currentCategoryName={currentCategoryName}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
              />
            </div>
            {/* Кнопка фильтров - справа на десктопе, под поиском на мобильных */}
            <div className="w-full md:w-auto flex justify-end md:justify-start">
              <FilterPanel
                locations={locations}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                initialFilters={{
                  location: filters.city || undefined,
                  priceFrom: filters.priceFrom ? Number(filters.priceFrom) : undefined,
                  priceTo: filters.priceTo ? Number(filters.priceTo) : undefined,
                }}
              />
            </div>
          </div>

          {/* Индикатор загрузки - адаптивный */}
          {loading && publicAds.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
              <FeatherIcons.FiLoader className="w-6 h-6 md:w-8 md:h-8 text-teal-600 animate-spin mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-gray-600">Поиск объявлений...</p>
            </div>
          )}
          
          {/* Список объявлений */}
          <AdListSection
              publicAds={publicAds}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              categories={categories}
              subcategories={subcategories}
              handleCategorySelect={handleCategorySelectAdapter}
              user={user}
              navigate={navigate}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              handleDelete={openDeleteModal}
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