// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adsReducer from './slices/adsSlice';
import favoritesReducer from './slices/favoritesSlice';
import categoriesReducer from './slices/categoriesSlice';
import searchReducer from './slices/searchSlice';

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

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

