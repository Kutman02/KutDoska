// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks для авторизации
export const loginUser = createAsyncThunk(
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: (() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  })(),
  token: localStorage.getItem("token") || null,
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
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
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
        state.error = action.payload;
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
        state.error = action.payload;
      });
  },
});

export const { logout, setUser, clearError, openLoginModal, openRegisterModal, closeLoginModal, closeRegisterModal, closeAllModals } = authSlice.actions;
export default authSlice.reducer;

