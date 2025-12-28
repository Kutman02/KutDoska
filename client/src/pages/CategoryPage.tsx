// src/pages/CategoryPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import * as FeatherIcons from "react-icons/fi";
import Breadcrumb from "../components/Breadcrumb";
import HomeSearchFilterBar from "../components/HomeSearchFilterBar";
import AdListSection from "../components/AdListSection";
import FilterPanel from "../components/FilterPanel";
import { useAppSelector } from "../store/hooks";
import useFavorites from "../hooks/useFavorites";
import useAdActions from "../hooks/useAdActions";
import toast from "react-hot-toast";
import type { Ad } from "../types/ad.types";
import type { Category } from "../types/category.types";
import type { Location } from "../types/location.types";
import type { PageFilters } from "../types/page.types";
import type { BreadcrumbItem } from "../types/component.types";

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [publicAds, setPublicAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<PageFilters>({
    city: '',
    priceFrom: '',
    priceTo: '',
  });

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/categories");
        if (!response.ok) throw new Error("Не удалось загрузить категории.");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Ошибка:", error);
        toast.error("Ошибка при загрузке категорий.");
      }
    };
    fetchCategories();
  }, []);

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

  // Загрузка категории по slug
  useEffect(() => {
    const fetchCategoryBySlug = async () => {
      if (!slug) return;
      
      try {
        const response = await fetch(`http://localhost:8080/api/categories/slug/${slug}`);
        if (!response.ok) {
          navigate("/");
          return;
        }
        const category = await response.json();
        setSelectedCategory(category._id);
        setSubcategories(category.subcategories || []);
      } catch (error) {
        console.error("Ошибка:", error);
        navigate("/");
      }
    };
    fetchCategoryBySlug();
  }, [slug, navigate]);

  // Синхронизация подкатегорий
  useEffect(() => {
    if (selectedCategory) {
      const currentCategory = categories.find(c => c._id === selectedCategory);
      setSubcategories(currentCategory?.subcategories || []);
    } else {
      setSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory, categories]);

  // Загрузка объявлений
  useEffect(() => {
    const fetchPublicAds = async () => {
      setLoading(true);
      setPublicAds([]);

      try {
        const params = new URLSearchParams();
        
        if (selectedSubcategory) {
          params.append('subcategory', selectedSubcategory);
        } else if (selectedCategory) {
          params.append('category', selectedCategory);
        }

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
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory) {
      fetchPublicAds();
    }
  }, [selectedCategory, selectedSubcategory, searchQuery, filters]);

  const handleCategorySelect = (categoryId: string | null) => {
    if (!categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      return;
    }
    const category = categories.find(c => c._id === categoryId);
    if (category && category.slug) {
      navigate(`/${category.slug}`);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleApplyFilters = (newFilters: PageFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      priceFrom: '',
      priceTo: '',
    });
  };

  const { isFavorite, toggleFavorite } = useFavorites();
  const { handleDelete } = useAdActions({ setPublicAds });

  const isInitialLoad = loading && publicAds.length === 0;

  if (isInitialLoad) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <FeatherIcons.FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-600">Загрузка объявлений...</p>
      </div>
    );
  }

  const currentCategory = categories.find((c: Category) => c._id === selectedCategory);
  const breadcrumbItems = currentCategory 
    ? [{ label: currentCategory.name, path: `/${currentCategory.slug || ''}` }]
    : [];

  const currentCategoryName = currentCategory?.name || "Все категории";

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        <div className="max-w-screen-xl mx-auto py-8">
          <Breadcrumb items={breadcrumbItems} showHomeIcon={true} />

          <div className="flex items-center justify-between mb-4">
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

export default CategoryPage;

