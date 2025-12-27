// src/hooks/useHomeAdsLogic.js
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Хук для управления состоянием, загрузкой категорий, объявлений и логикой фильтрации.
 */
const useHomeAdsLogic = () => {
  const [publicAds, setPublicAds] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
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
        const currentCategory = categories.find(c => c._id === selectedCategory);
        setSubcategories(currentCategory?.subcategories || []);
    } else {
        setSubcategories([]);
        setSelectedSubcategory(null);
    }
  }, [selectedCategory, categories]); 

  // 3. Загрузка объявлений при изменении фильтров или поискового запроса
  useEffect(() => {
    const fetchPublicAds = async () => {
      setLoading(true);
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
          setPublicAds(data);
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
          setPublicAds(data);
        }
      } catch (error) {
        console.error("Ошибка:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicAds();
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  
  // 4. Обработчик выбора категории
  const handleCategorySelect = (categoryId, options = {}) => {
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
  const handleSubcategorySelect = (subcategoryId) => {
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