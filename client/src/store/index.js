// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import adsReducer from './slices/adsSlice.js';
import favoritesReducer from './slices/favoritesSlice.js';
import categoriesReducer from './slices/categoriesSlice.js';
import searchReducer from './slices/searchSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ads: adsReducer,
    favorites: favoritesReducer,
    categories: categoriesReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ads/setAds', 'favorites/setFavorites'],
      },
    }),
});

