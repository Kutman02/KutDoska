// src/store/slices/searchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk для поиска
export const searchAds = createAsyncThunk(
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
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  query: '',
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action) => {
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
        state.error = action.payload;
      });
  },
});

export const { setQuery, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;

