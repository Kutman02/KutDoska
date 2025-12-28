// src/store/slices/adsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AdsState } from '../../types/redux.types';
import type { Ad, CreateAdData } from '../../types/ad.types';

interface FetchAdsParams {
  category?: string;
  subcategory?: string;
}

// Async thunks для объявлений
export const fetchAds = createAsyncThunk<Ad[], FetchAdsParams | undefined, { rejectValue: string }>(
  'ads/fetchAds',
  async ({ category, subcategory } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (subcategory) {
        params.append('subcategory', subcategory);
      } else if (category) {
        params.append('category', category);
      }
      const queryString = params.toString();
      const url = `http://localhost:8080/api/ads/latest${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      if (!res.ok) {
        return rejectWithValue("Ошибка загрузки объявлений");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchAdById = createAsyncThunk<Ad, string, { rejectValue: string }>(
  'ads/fetchAdById',
  async (id, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch(`http://localhost:8080/api/ads/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        return rejectWithValue("Объявление не найдено");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createAd = createAsyncThunk<Ad, CreateAdData, { rejectValue: string }>(
  'ads/createAd',
  async (adData, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch("http://localhost:8080/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adData),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Ошибка создания объявления");
      }
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

interface UpdateAdParams {
  id: string;
  adData: Partial<CreateAdData>;
}

export const updateAd = createAsyncThunk<Ad, UpdateAdParams, { rejectValue: string }>(
  'ads/updateAd',
  async ({ id, adData }, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch(`http://localhost:8080/api/ads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adData),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Ошибка обновления объявления");
      }
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteAd = createAsyncThunk<string, string, { rejectValue: string }>(
  'ads/deleteAd',
  async (id, { rejectWithValue }) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch(`http://localhost:8080/api/ads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        return rejectWithValue(data.message || "Ошибка удаления объявления");
      }
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchUserAds = createAsyncThunk<Ad[], string, { rejectValue: string }>(
  'ads/fetchUserAds',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:8080/api/auth/users/${userId}/ads`);
      if (!res.ok) {
        return rejectWithValue("Ошибка загрузки объявлений пользователя");
      }
      return await res.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: AdsState = {
  ads: [],
  currentAd: null,
  userAds: [],
  loading: false,
  error: null,
};

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setAds: (state, action: PayloadAction<Ad[]>) => {
      state.ads = action.payload;
    },
    clearCurrentAd: (state) => {
      state.currentAd = null;
    },
    removeAd: (state, action: PayloadAction<string>) => {
      state.ads = state.ads.filter(ad => ad._id !== action.payload);
      state.userAds = state.userAds.filter(ad => ad._id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Ads
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка загрузки объявлений';
      })
      // Fetch Ad By Id
      .addCase(fetchAdById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
      })
      .addCase(fetchAdById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Объявление не найдено';
      })
      // Create Ad
      .addCase(createAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.loading = false;
        state.ads.unshift(action.payload);
      })
      .addCase(createAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка создания объявления';
      })
      // Update Ad
      .addCase(updateAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.ads.findIndex(ad => ad._id === action.payload._id);
        if (index !== -1) {
          state.ads[index] = action.payload;
        }
        if (state.currentAd && state.currentAd._id === action.payload._id) {
          state.currentAd = action.payload;
        }
      })
      .addCase(updateAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка обновления объявления';
      })
      // Delete Ad
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.ads = state.ads.filter(ad => ad._id !== action.payload);
        state.userAds = state.userAds.filter(ad => ad._id !== action.payload);
        if (state.currentAd && state.currentAd._id === action.payload) {
          state.currentAd = null;
        }
      })
      // Fetch User Ads
      .addCase(fetchUserAds.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAds.fulfilled, (state, action) => {
        state.loading = false;
        state.userAds = action.payload;
      })
      .addCase(fetchUserAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка загрузки объявлений пользователя';
      });
  },
});

export const { setAds, clearCurrentAd, removeAd, clearError } = adsSlice.actions;
export default adsSlice.reducer;

