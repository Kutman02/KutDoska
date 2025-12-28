// Типы для Redux состояний
import { User, AuthResponse } from './user.types';
import { Ad } from './ad.types';
import { Category } from './category.types';
import { Favorite } from './favorite.types';

// Auth State
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  showLoginModal: boolean;
  showRegisterModal: boolean;
}

// Ads State
export interface AdsState {
  ads: Ad[];
  currentAd: Ad | null;
  userAds: Ad[];
  loading: boolean;
  error: string | null;
}

// Categories State
export interface CategoriesState {
  categories: Category[];
  subcategories: Category[];
  selectedCategory: Category | null;
  selectedSubcategory: Category | null;
  loading: boolean;
  error: string | null;
}

// Favorites State
export interface FavoritesState {
  favorites: Ad[]; // API возвращает массив объявлений напрямую
  favoriteIds: string[];
  count: number;
  loading: boolean;
  error: string | null;
}

// Search State
export interface SearchState {
  query: string;
  results: Ad[];
  loading: boolean;
  error: string | null;
}

// Theme State
export interface ThemeState {
  mode: 'light' | 'dark';
}

// Root State
export interface RootState {
  auth: AuthState;
  ads: AdsState;
  categories: CategoriesState;
  favorites: FavoritesState;
  search: SearchState;
  theme: ThemeState;
}

