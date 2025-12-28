// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthResponse } from '../../types/redux.types';
import type { LoginCredentials, RegisterData, User } from '../../types/user.types';

// Async thunks для авторизации
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Ошибка входа");
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
      }
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterData, { rejectValue: string }>(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Ошибка регистрации");
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
      }
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: AuthState = {
  user: (() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  })(),
  token: typeof window !== 'undefined' ? localStorage.getItem("token") : null,
  loading: false,
  error: null,
  showLoginModal: false,
  showRegisterModal: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.showLoginModal = false;
      state.showRegisterModal = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload && typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    openLoginModal: (state) => {
      state.showLoginModal = true;
      state.showRegisterModal = false;
    },
    openRegisterModal: (state) => {
      state.showRegisterModal = true;
      state.showLoginModal = false;
    },
    closeLoginModal: (state) => {
      state.showLoginModal = false;
    },
    closeRegisterModal: (state) => {
      state.showRegisterModal = false;
    },
    closeAllModals: (state) => {
      state.showLoginModal = false;
      state.showRegisterModal = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.showLoginModal = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка входа';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.showRegisterModal = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка регистрации';
      });
  },
});

export const { logout, setUser, clearError, openLoginModal, openRegisterModal, closeLoginModal, closeRegisterModal, closeAllModals } = authSlice.actions;
export default authSlice.reducer;

