// Типы для настроек профиля
import { User } from './user.types';

export interface ProfileSettings {
  _id: string;
  user: string | User;
  displayName: string;
  phone: string;
  about: string;
  profileImageUrl: string;
  website: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileSettingsWithUser extends ProfileSettings {
  user: User;
}

export interface UpdateProfileSettingsData {
  displayName?: string;
  phone?: string;
  about?: string;
  profileImageUrl?: string;
  website?: string;
}

