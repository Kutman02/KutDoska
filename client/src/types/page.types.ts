// Типы для страниц
import { Ad } from './ad.types';
import { Category } from './category.types';
import { Location } from './location.types';
import { User } from './user.types';
import { AdFilters } from './ad.types';

// Типы для Chats
export interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

export interface AllMessages {
  [chatId: number]: Message[];
}

// Типы для фильтров (расширение AdFilters)
export interface PageFilters {
  city: string;
  priceFrom: string;
  priceTo: string;
}

// Типы для состояний страниц
export interface CategoryPageState {
  publicAds: Ad[];
  categories: Category[];
  subcategories: Category[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  loading: boolean;
  searchQuery: string;
  locations: Location[];
  filters: PageFilters;
}

export interface PublicHomeState {
  publicAds: Ad[];
  categories: Category[];
  subcategories: Category[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  loading: boolean;
  searchQuery: string;
  locations: Location[];
  filters: PageFilters;
}

// Типы для UserProfile
export interface UserProfileData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  about?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

