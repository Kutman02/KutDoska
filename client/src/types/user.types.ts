// Типы для пользователя
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string; // Обычно не включается в ответы API
  role: 'user' | 'admin';
  phone?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserWithToken extends User {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  token: string;
}

