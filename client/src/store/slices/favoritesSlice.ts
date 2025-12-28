// src/store/slices/favoritesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { FavoritesState, RootState } from '../../types/redux.types';
import type { Favorite } from '../../types/favorite.types';
import type { Ad } from '../../types/ad.types';

// Async thunks для избранного
export const fetchFavorites = createAsyncThunk<Ad[], void, { rejectValue: string }>(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        return rejectWithValue("Не авторизован");
      }

      const res = await fetch("http://localhost:8080/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return rejectWithValue("Ошибка загрузки избранного");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

interface ToggleFavoriteResponse {
  adId: string;
  isFavorite: boolean;
}

export const toggleFavorite = createAsyncThunk<ToggleFavoriteResponse, string, { state: RootState; rejectValue: string }>(
  'favorites/toggleFavorite',
  async (adId, { getState, rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        return rejectWithValue("Не авторизован");
      }

      const state = getState();
      const isFavorite = state.favorites.favoriteIds.includes(adId);
      const method = isFavorite ? 'DELETE' : 'POST';

      const res = await fetch(`http://localhost:8080/api/favorites/${adId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return rejectWithValue("Ошибка операции с избранным");
      }

      return { adId, isFavorite: !isFavorite };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: FavoritesState = {
  favorites: [],
  favoriteIds: [],
  count: 0,
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavoriteIds: (state, action: PayloadAction<string[]>) => {
      state.favoriteIds = action.payload;
      state.count = action.payload.length;
    },
    clearFavorites: (state) => {
      state.favorites = [];
      state.favoriteIds = [];
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
        state.favoriteIds = action.payload.map((ad: Ad) => ad._id);
        state.count = action.payload.length;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка загрузки избранного';
      })
      // Toggle Favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { adId, isFavorite } = action.payload;
        if (isFavorite) {
          if (!state.favoriteIds.includes(adId)) {
            state.favoriteIds.push(adId);
            state.count = state.favoriteIds.length;
          }
        } else {
          state.favoriteIds = state.favoriteIds.filter(id => id !== adId);
          state.count = state.favoriteIds.length;
        }
      });
  },
});

export const { setFavoriteIds, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

