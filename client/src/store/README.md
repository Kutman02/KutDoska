# Redux Toolkit (RTK) Migration Guide

## ✅ Выполнено

### 1. Store Setup
- ✅ Создан главный store (`store/index.js`)
- ✅ Настроен Redux Provider в `main.jsx`
- ✅ Созданы типизированные хуки (`store/hooks.js`)

### 2. Slices
- ✅ `authSlice` - управление авторизацией (login, register, logout)
- ✅ `adsSlice` - управление объявлениями (fetch, create, update, delete)
- ✅ `favoritesSlice` - управление избранным
- ✅ `categoriesSlice` - управление категориями
- ✅ `searchSlice` - управление поиском

### 3. Мигрированные компоненты
- ✅ `App.jsx` - использует RTK вместо AuthContext
- ✅ `main.jsx` - добавлен Redux Provider
- ✅ `PrivateRoute.jsx` - использует RTK
- ✅ `Login.jsx` - использует `loginUser` thunk
- ✅ `Register.jsx` - использует `registerUser` thunk
- ✅ `Navbar.jsx` - использует RTK для auth и favorites

## 🔄 Осталось мигрировать

### Компоненты, которые нужно обновить:

1. **PublicHome.jsx**
   - Заменить `useHomeAdsLogic` на `useAppSelector` и `useAppDispatch`
   - Использовать `fetchAds`, `setSelectedCategory`, `setSelectedSubcategory` из slices
   - Использовать `searchAds` из searchSlice

2. **AdView.jsx**
   - Использовать `fetchAdById` из adsSlice
   - Заменить локальное состояние на RTK

3. **CreateAd.jsx**
   - Использовать `createAd` thunk из adsSlice
   - Использовать `fetchCategories` из categoriesSlice

4. **EditAd.jsx**
   - Использовать `fetchAdById` и `updateAd` из adsSlice
   - Использовать `fetchCategories` из categoriesSlice

5. **Favorites.jsx**
   - Использовать `fetchFavorites` и `toggleFavorite` из favoritesSlice

6. **UserProfile.jsx**
   - Использовать `fetchUserAds` из adsSlice

7. **MyAds.jsx** (DashboardTabs)
   - Использовать `fetchAds` с фильтром по пользователю

8. **useFavorites.js** (hook)
   - Заменить на использование favoritesSlice напрямую

9. **useHomeAdsLogic.js** (hook)
   - Заменить на использование соответствующих slices

## 📝 Примеры использования

### Использование auth slice:
```javascript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, logout } from '../store/slices/authSlice';

const { user, loading, error } = useAppSelector(state => state.auth);
const dispatch = useAppDispatch();

// Login
await dispatch(loginUser({ email, password }));

// Logout
dispatch(logout());
```

### Использование ads slice:
```javascript
import { fetchAds, createAd } from '../store/slices/adsSlice';

// Fetch ads
dispatch(fetchAds({ category: '123' }));

// Create ad
dispatch(createAd(adData));
```

### Использование favorites slice:
```javascript
import { fetchFavorites, toggleFavorite } from '../store/slices/favoritesSlice';

// Fetch favorites
dispatch(fetchFavorites());

// Toggle favorite
dispatch(toggleFavorite(adId));
```

## 🚀 Следующие шаги

1. Мигрировать оставшиеся компоненты по списку выше
2. Удалить `AuthContext.jsx` после полной миграции
3. Удалить старые хуки (`useFavorites.js`, `useHomeAdsLogic.js`) после миграции
4. Протестировать все функции приложения

