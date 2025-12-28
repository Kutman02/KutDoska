import React, { useState, useEffect, useCallback } from "react";
import { FiLogOut, FiPlusSquare, FiUser, FiHome, FiLogIn, FiHeart, FiMessageSquare, FiLayout } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout, openLoginModal, openRegisterModal } from "../store/slices/authSlice";
import { fetchFavorites } from "../store/slices/favoritesSlice";

interface BottomNavProps {
  isLoggedIn: boolean;
  favoritesCount?: number;
  onOpenLogin: () => void;
}

// --- Компонент Нижней Навигации для Мобильных Устройств ---
const BottomNav: React.FC<BottomNavProps> = ({ isLoggedIn, favoritesCount = 0, onOpenLogin }) => {
    const location = useLocation();
    
    // Определяем иконки и маршруты для нижней панели
    const navItems = [
        { name: "Домой", icon: FiHome, path: "/" },
        { name: "Избранное", icon: FiHeart, path: isLoggedIn ? "/favorites" : null, requiresAuth: !isLoggedIn }, 
        { name: "Подать", icon: FiPlusSquare, path: "/create", isAccent: true, requiresAuth: !isLoggedIn }, 
        { name: "Чаты", icon: FiMessageSquare, path: isLoggedIn ? "/chats" : null, requiresAuth: !isLoggedIn },
        { name: "Профиль", icon: FiUser, path: isLoggedIn ? "/dashboard" : null, requiresAuth: !isLoggedIn },
    ];

    return (
        // Фиксированная нижняя панель: видима ТОЛЬКО на мобильных (md:hidden)
        <div className="fixed bottom-0 left-0 w-full md:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 z-50 p-1 transition-colors duration-200">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = item.path !== "/create" && location.pathname === item.path;
                    
                    const activeClass = "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30";
                    const inactiveClass = "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700";
                    
                    if (item.isAccent) {
                        if (item.requiresAuth) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={onOpenLogin}
                                    className="flex flex-col items-center justify-center p-2 rounded-full transform -translate-y-4 
                                               bg-teal-600 text-white w-14 h-14 hover:bg-teal-700 transition-colors"
                                >
                                    <item.icon className="w-6 h-6" />
                                </button>
                            );
                        }
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="flex flex-col items-center justify-center p-2 rounded-full transform -translate-y-4 
                                           bg-teal-600 text-white w-14 h-14 hover:bg-teal-700 transition-colors"
                            >
                                <item.icon className="w-6 h-6" />
                            </Link>
                        );
                    }

                    if (item.requiresAuth) {
                        return (
                            <button
                                key={item.name}
                                onClick={onOpenLogin}
                                className={`flex flex-col items-center p-2 rounded-md transition-colors relative ${
                                    isActive ? activeClass : inactiveClass
                                }`}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-xs mt-0.5">{item.name}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            to={item.path || '/'}
                            className={`flex flex-col items-center p-2 rounded-md transition-colors relative ${
                                isActive ? activeClass : inactiveClass
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs mt-0.5">{item.name}</span>
                            {item.name === "Избранное" && isLoggedIn && favoritesCount > 0 && (
                              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {favoritesCount > 99 ? '99+' : favoritesCount}
                              </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
// --- Конец компонента Нижней Навигации ---


const Navbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, token } = useAppSelector((state) => state.auth);
  const { count: favoritesCount } = useAppSelector((state) => state.favorites);
  const isLoggedIn = !!user && !!token;

  // Загрузка избранного при монтировании и обновлении
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchFavorites());
      // Обновляем каждые 30 секунд
      const interval = setInterval(() => {
        dispatch(fetchFavorites());
      }, 30000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isLoggedIn, dispatch]);

  // Функция загрузки фото профиля
  const fetchProfileImage = useCallback(async () => {
    if (!isLoggedIn) {
      setProfileImageUrl(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:8080/api/auth/profile/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProfileImageUrl(data.profileImageUrl || null);
      }
    } catch (err) {
      console.error("Ошибка загрузки фото профиля:", err);
    }
  }, [isLoggedIn]);

  // Загрузка фото профиля при монтировании и изменении пользователя
  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage, user]);

  // Слушатель события обновления профиля
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfileImage();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [fetchProfileImage]);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate("/");
  };

  const getInitial = () => user?.name?.[0]?.toUpperCase() || "U";

  return (
    <>
      {/* 1. Верхняя Навигационная панель (Скрыта на мобильных, md:block) */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 hidden md:block transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div
              className="text-3xl cursor-pointer tracking-widest font-extrabold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
              onClick={() => navigate("/")}
            >
              KUTDOSKA
            </div>

            {/* Десктопная навигация */}
            <div className="flex items-center gap-6">
              {isLoggedIn ? (
                <>
                  {/* ИЗБРАННОЕ */}
                  <Link
                    to="/favorites"
                    className="text-gray-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 relative"
                  >
                    <FiHeart className="w-5 h-5" />
                    {/* {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {favoritesCount > 99 ? '99+' : favoritesCount}
                      </span>
                    )} */}
                  </Link>

                  {/* ЧАТЫ */}
                  <Link
                    to="/chats"
                    className="text-gray-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                
                  </Link>


                  {/* Новое объявление (Кнопка акцента) */}
                  <Link
                    to="/create"
                    className="flex items-center gap-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors font-semibold text-sm"
                  >
                    <FiPlusSquare className="w-4 h-4" />
                    Новое объявление
                  </Link>

                  {/* Иконка пользователя и Выпадающее меню */}
                  <div className="relative profile-dropdown-container">
                    <div
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all overflow-hidden border-2 border-gray-200 dark:border-slate-600"
                    >
                      {profileImageUrl ? (
                        <img 
                          src={profileImageUrl} 
                          alt={user?.name || "Профиль"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gray-100 dark:bg-slate-700 text-teal-600 dark:text-teal-400 font-bold w-full h-full flex items-center justify-center">
                          {getInitial()}
                        </div>
                      )}
                    </div>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg overflow-hidden z-50 border border-gray-200 dark:border-slate-700 shadow-xl">
                        
                        {/* Мои Объявления */}
                        <Link
                            to="/dashboard?tab=ads"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-200 dark:border-slate-700"
                        >
                            <FiLayout className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                            <span className="font-medium">Мои Объявления</span>
                        </Link>

                        {/* Настройки Профиля */}
                        <Link
                            to="/dashboard?tab=profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-200 dark:border-slate-700"
                        >
                            <FiUser className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                            <span className="font-medium">Настройки Профиля</span>
                        </Link>

                        {/* Выйти */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span className="font-medium">Выйти</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Единая иконка для Входа/Регистрации (Неавторизованный пользователь)
                <div className="relative">
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="text-teal-600 dark:text-teal-400 bg-gray-100 dark:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors p-1"
                    title="Войти или Зарегистрироваться"
                  >
                    <FiUser className="w-6 h-6" />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md overflow-hidden z-50 border border-gray-200 dark:border-slate-700 shadow-lg">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          dispatch(openLoginModal());
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-200 dark:border-slate-700"
                      >
                        <FiLogIn className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                        Войти
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          dispatch(openRegisterModal());
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <FiUser className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                        Регистрация
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* 2. Нижняя панель навигации (Только для мобильных, md:hidden) */}
      <BottomNav 
        isLoggedIn={isLoggedIn} 
        favoritesCount={favoritesCount} 
        onOpenLogin={() => dispatch(openLoginModal())}
      />
    </>
  );
};

export default Navbar;