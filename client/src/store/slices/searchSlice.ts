// src/store/slices/searchSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { SearchState } from '../../types/redux.types';
import type { Ad } from '../../types/ad.types';

interface SearchAdsParams {
  query: string;
  category?: string;
  subcategory?: string;
}

// Async thunk для поиска
export const searchAds = createAsyncThunk<Ad[], SearchAdsParams, { rejectValue: string }>(
  'search/searchAds',
  async ({ query, category, subcategory }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (subcategory) {
        params.append('subcategory', subcategory);
      } else if (category) {
        params.append('category', category);
      }
      const url = `http://localhost:8080/api/ads/search?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        return rejectWithValue("Ошибка поиска");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка поиска';
      });
  },
});

export const { setQuery, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;

