// src/hooks/useHomeAdsLogic.ts
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Ad } from "../types/ad.types";
import type { Category } from "../types/category.types";

interface CategorySelectOptions {
    isDropdownSelection?: boolean;
}

interface UseHomeAdsLogicReturn {
    publicAds: Ad[];
    setPublicAds: React.Dispatch<React.SetStateAction<Ad[]>>;
    categories: Category[];
    subcategories: Category[];
    selectedCategory: string | null;
    selectedSubcategory: string | null;
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleCategorySelect: (categoryId: string | null, options?: CategorySelectOptions) => void;
    handleSubcategorySelect: (subcategoryId: string | null) => void;
}

/**
 * Хук для управления состоянием, загрузкой категорий, объявлений и логикой фильтрации.
 */
const useHomeAdsLogic = (): UseHomeAdsLogicReturn => {
  const [publicAds, setPublicAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); 

  // 1. Загрузка категорий (только один раз при монтировании)
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/categories");
            if (!response.ok) throw new Error("Не удалось загрузить категории.");
            const data = await response.json(); 
            setCategories(data);
        } catch (error) {
            console.error("Ошибка:", error);
            toast.error("Ошибка при загрузке структуры категорий.");
        }
    };
    fetchCategories();
  }, []); 

  // 2. Синхронизация подкатегорий при изменении категории
  useEffect(() => {
    if (selectedCategory) {
        const currentCategory = categories.find((c: Category) => c._id === selectedCategory);
        if (currentCategory?.subcategories) {
            // Преобразуем subcategories в Category[]
            const subs = currentCategory.subcategories;
            const typedSubs = Array.isArray(subs) && subs.length > 0 && typeof subs[0] === 'object' 
                ? subs as Category[] 
                : [];
            setSubcategories(typedSubs);
        } else {
            setSubcategories([]);
        }
    } else {
        setSubcategories([]);
        setSelectedSubcategory(null);
    }
  }, [selectedCategory, categories]); 

  // 3. Загрузка объявлений при изменении фильтров или поискового запроса
  useEffect(() => {
    const fetchPublicAds = async () => {
      // Сразу показываем загрузку и очищаем старые результаты
      setLoading(true);
      setPublicAds([]); // Очищаем старые результаты перед новым поиском
      
      try {
        // Если есть поисковый запрос, используем поиск
        if (searchQuery && searchQuery.trim().length > 0) {
          const params = new URLSearchParams();
          params.append('q', searchQuery.trim());
          if (selectedSubcategory) {
            params.append('subcategory', selectedSubcategory);
          } else if (selectedCategory) {
            params.append('category', selectedCategory);
          }
          const queryString = params.toString();
          const url = `http://localhost:8080/api/ads/search?${queryString}`;
          
          const response = await fetch(url); 
          if (!response.ok) throw new Error(`Ошибка поиска: ${response.status}`);
          
          const data = await response.json();
          setPublicAds(data || []);
        } else {
          // Обычная загрузка объявлений
          const params = new URLSearchParams();
          if (selectedSubcategory) {
            params.append('subcategory', selectedSubcategory);
          } else if (selectedCategory) {
            params.append('category', selectedCategory);
          }
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
        setPublicAds([]); // Очищаем результаты при ошибке
      } finally {
        setLoading(false);
      }
    };

    fetchPublicAds();
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  
  // 4. Обработчик выбора категории
  const handleCategorySelect = (categoryId: string | null, options: CategorySelectOptions = {}) => {
    const { isDropdownSelection } = options;
    if (isDropdownSelection) {
        setSelectedCategory(categoryId);
        return;
    }
    // Сброс фильтра при клике "Сбросить"
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  // 5. Обработчик выбора подкатегории
  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  return {
    publicAds,
    setPublicAds, // Важно для локального обновления после удаления
    categories,
    subcategories,
    selectedCategory,
    selectedSubcategory,
    loading,
    searchQuery,
    setSearchQuery,
    handleCategorySelect,
    handleSubcategorySelect,
  };
};

export default useHomeAdsLogic;