// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adsReducer from './slices/adsSlice';
import favoritesReducer from './slices/favoritesSlice';
import categoriesReducer from './slices/categoriesSlice';
import searchReducer from './slices/searchSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ads: adsReducer,
    favorites: favoritesReducer,
    categories: categoriesReducer,
    search: searchReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ads/setAds', 'favorites/setFavorites'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

