// Типы для компонентов
import { Category } from './category.types';
import { Location } from './location.types';
import { AdFilters } from './ad.types';
import { ComponentType } from 'react';

// Breadcrumb
export interface BreadcrumbItem {
  label: string;
  path: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHomeIcon?: boolean;
  onItemClick?: (categoryId: string | null) => void;
}

// FilterPanel
export interface FilterPanelProps {
  locations?: Location[];
  onApplyFilters: (filters: AdFilters) => void;
  onClearFilters: () => void;
  initialFilters?: AdFilters;
}

// CategoryDropdown
export interface CategoryDropdownProps {
  categories: Category[];
  selectedCategory?: Category | null;
  selectedSubcategory?: Category | null;
  onCategorySelect: (category: Category | null) => void;
  onSubcategorySelect: (subcategory: Category | null) => void;
}

// AdCard
export interface AdCardProps {
  ad: any; // Будет заменено на Ad после типизации компонента
  onFavoriteToggle?: (adId: string) => void;
  isFavorite?: boolean;
}

// ImageUploader
export interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

// TabButton
export interface TabButtonProps {
  tabName: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

