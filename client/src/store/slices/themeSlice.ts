// src/store/slices/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

// Функция для применения темы к DOM
const applyThemeToDOM = (theme: ThemeMode): void => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

// Функция получения начальной темы
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    return saved as ThemeMode;
  }
  return 'light';
};

// Применяем тему при инициализации модуля
const initialTheme = getInitialTheme();
if (typeof window !== 'undefined') {
  applyThemeToDOM(initialTheme);
}

interface ThemeState {
  mode: ThemeMode;
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme,
  } as ThemeState,
  reducers: {
    toggleTheme: (state) => {
      // Переключаем тему
      const newMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      
      // Сохраняем в localStorage
      localStorage.setItem('theme', newMode);
      
      // Применяем к DOM немедленно
      applyThemeToDOM(newMode);
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      const newMode = action.payload;
      if (newMode === 'dark' || newMode === 'light') {
        state.mode = newMode;
        localStorage.setItem('theme', newMode);
        applyThemeToDOM(newMode);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;

