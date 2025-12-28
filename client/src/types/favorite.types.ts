// Типы для избранного
import { Ad } from './ad.types';
import { User } from './user.types';

export interface Favorite {
  _id: string;
  user: string | User;
  ad: string | Ad;
  createdAt?: string;
  updatedAt?: string;
}

export interface FavoriteWithDetails extends Favorite {
  user: User;
  ad: Ad;
}

