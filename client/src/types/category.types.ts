// Типы для категорий
export interface Category {
  _id: string;
  name: string;
  slug?: string;
  icon: string;
  parent?: string | Category | null;
  subcategories?: string[] | Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryWithSubcategories extends Category {
  parent: Category | null;
  subcategories: Category[];
}

export interface CreateCategoryData {
  name: string;
  icon: string;
  parent?: string | null;
  slug?: string;
}

export interface UpdateCategoryData {
  _id: string;
  name?: string;
  icon?: string;
  parent?: string | null;
}

