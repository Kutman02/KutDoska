// Типы для объявлений
import { Category } from './category.types';
import { User } from './user.types';
import { Location } from './location.types';

export type AdStatus = 'Active' | 'Sold' | 'Paused' | 'Draft';

export interface Ad {
  _id: string;
  title: string;
  content: string;
  price: number;
  location: string;
  locationId: string | Location;
  phone: string;
  hidePhone: boolean;
  category: string | Category;
  subcategory?: string | Category | null;
  user: string | User;
  imageUrl: string;
  images: string[];
  tags: string[];
  status: AdStatus;
  isFeatured: boolean;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdWithDetails extends Ad {
  category: Category;
  subcategory?: Category | null;
  user: User;
  locationId: Location;
}

export interface CreateAdData {
  title?: string;
  content: string;
  price?: number;
  location?: string;
  locationId: string;
  phone?: string;
  hidePhone?: boolean;
  category: string;
  subcategory?: string | null;
  imageUrl?: string;
  images?: string[];
  tags?: string[];
  status?: AdStatus;
}

export interface UpdateAdData extends Partial<CreateAdData> {
  _id: string;
}

export interface AdFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  priceFrom?: number;
  priceTo?: number;
  status?: AdStatus;
}

