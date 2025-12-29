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
export interface CategoryDropdownSelectOptions {
  isDropdownSelection?: boolean;
}

export interface CategoryDropdownProps {
  categories: Category[];
  onCategorySelect: (categoryId: string | null, options?: CategoryDropdownSelectOptions) => void;
  onSubcategorySelect: (subcategoryId: string | null) => void;
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
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}

// TabButton
export interface TabButtonProps {
  tabName: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

