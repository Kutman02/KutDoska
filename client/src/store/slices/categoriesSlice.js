// src/store/slices/categoriesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks для категорий
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8080/api/categories");
      if (!res.ok) {
        return rejectWithValue("Ошибка загрузки категорий");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  'categories/fetchSubcategories',
  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8080/api/categories/${categoryId}/subcategories`);
      if (!res.ok) {
        return rejectWithValue("Ошибка загрузки подкатегорий");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  categories: [],
  subcategories: [],
  selectedCategory: null,
  selectedSubcategory: null,
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.selectedSubcategory = null;
      state.subcategories = [];
    },
    setSelectedSubcategory: (state, action) => {
      state.selectedSubcategory = action.payload;
    },
    clearFilters: (state) => {
      state.selectedCategory = null;
      state.selectedSubcategory = null;
      state.subcategories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedCategory, setSelectedSubcategory, clearFilters } = categoriesSlice.actions;
export default categoriesSlice.reducer;

