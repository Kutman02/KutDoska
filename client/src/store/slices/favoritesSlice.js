// src/store/slices/favoritesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks для избранного
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
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
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (adId, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
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
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
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
    setFavoriteIds: (state, action) => {
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
        state.favoriteIds = action.payload.map(ad => ad._id);
        state.count = action.payload.length;
        // Отправляем событие для обновления счетчика в Navbar
        window.dispatchEvent(new Event('favoritesUpdated'));
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        // Отправляем событие для обновления счетчика в Navbar
        window.dispatchEvent(new Event('favoritesUpdated'));
      });
  },
});

export const { setFavoriteIds, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

