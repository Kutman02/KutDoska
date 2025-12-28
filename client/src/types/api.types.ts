// Типы для API ответов и запросов
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams {
  q?: string;
  category?: string;
  subcategory?: string;
  location?: string;
  priceFrom?: number;
  priceTo?: number;
  page?: number;
  limit?: number;
}

