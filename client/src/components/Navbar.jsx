import { useState } from "react";
import { FiLogOut, FiPlusSquare, FiUser, FiHome, FiLogIn, FiHeart, FiMessageSquare, FiLayout } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// --- Компонент Нижней Навигации для Мобильных Устройств ---
const BottomNav = ({ isLoggedIn, navigate }) => {
    const location = useLocation();
    
    // Определяем иконки и маршруты для нижней панели
    const navItems = [
        { name: "Домой", icon: FiHome, path: "/" },
        { name: "Избранное", icon: FiHeart, path: isLoggedIn ? "/favorites" : "/login" }, 
        { name: "Подать", icon: FiPlusSquare, path: "/create", isAccent: true }, 
        { name: "Чаты", icon: FiMessageSquare, path: isLoggedIn ? "/chats" : "/login" },
        { name: "Профиль", icon: FiUser, path: isLoggedIn ? "/dashboard" : "/login" },
    ];

    return (
        // Фиксированная нижняя панель: видима ТОЛЬКО на мобильных (md:hidden)
        <div className="fixed bottom-0 left-0 w-full md:hidden bg-white border-t border-gray-200 shadow-2xl shadow-gray-400/50 z-50 p-1">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = item.path !== "/create" && location.pathname === item.path;
                    
                    const activeClass = "text-teal-600 bg-teal-50 shadow-md shadow-teal-100";
                    const inactiveClass = "text-gray-500 hover:bg-gray-100";
                    
                    if (item.isAccent) {
                        return (
                            <Link
                                key={item.name}
                                to={isLoggedIn ? item.path : "/login"}
                                className="flex flex-col items-center justify-center p-2 rounded-full transform -translate-y-4 
                                           bg-teal-600 text-white w-14 h-14 shadow-xl shadow-teal-400/70 hover:bg-teal-700 transition duration-300"
                            >
                                <item.icon className="w-6 h-6" />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center p-2 rounded-xl transition duration-200 ${
                                isActive ? activeClass : inactiveClass
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs mt-0.5">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
// --- Конец компонента Нижней Навигации ---


const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const getInitial = () => user?.name?.[0]?.toUpperCase() || "U";

  return (
    <>
      {/* 1. Верхняя Навигационная панель (Скрыта на мобильных, md:block) */}
      <nav className="bg-white shadow-lg shadow-gray-300/50 sticky top-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div
              className="text-3xl cursor-pointer tracking-widest font-extrabold text-teal-600 hover:text-teal-500 transition duration-300"
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
                    className="text-gray-700 hover:text-teal-600 transition duration-200 flex items-center gap-1 p-2 rounded-lg hover:bg-teal-50 hover:shadow-inner"
                  >
                    <FiHeart className="w-5 h-5" />
                    
                  </Link>

                  {/* ЧАТЫ */}
                  <Link
                    to="/chats"
                    className="text-gray-700 hover:text-teal-600 transition duration-200 flex items-center gap-1 p-2 rounded-lg hover:bg-teal-50 hover:shadow-inner"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                
                  </Link>


                  {/* Новое объявление (Кнопка акцента) */}
                  <Link
                    to="/create"
                    className="flex items-center gap-1 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition duration-300 font-semibold text-sm shadow-md shadow-teal-300/50 hover:shadow-lg hover:shadow-teal-400/50"
                  >
                    <FiPlusSquare className="w-4 h-4" />
                    Новое объявление
                  </Link>

                  {/* Иконка пользователя и Выпадающее меню */}
                  <div className="relative">
                    <div
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="bg-white text-teal-600 font-bold w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer ring-2 ring-teal-500 hover:ring-teal-600 transition duration-300 shadow-md shadow-gray-300/50"
                    >
                      {getInitial()}
                    </div>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl shadow-gray-400/50 rounded-xl overflow-hidden z-50 border border-gray-200">
                        
                        {/* Мои объявления (ПЕРЕМЕЩЕНО СЮДА) */}
                        <Link
                            to="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 transition duration-200 border-b border-gray-200"
                        >
                            <FiLayout className="w-5 h-5 text-teal-500" />
                            Профиль
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 transition duration-200"
                        >
                          <FiLogOut className="w-5 h-5" />
                          Выйти
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
                    className="text-teal-600 bg-white w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer ring-2 ring-teal-500 hover:ring-teal-600 transition duration-300 p-1 shadow-md shadow-gray-300/50"
                    title="Войти или Зарегистрироваться"
                  >
                    <FiUser className="w-6 h-6" />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl shadow-gray-400/50 rounded-xl overflow-hidden z-50 border border-gray-200">
                      <Link
                        to="/login"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 transition duration-200 border-b border-gray-200"
                      >
                        <FiLogIn className="w-5 h-5 text-teal-500" />
                        Войти
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 transition duration-200"
                      >
                        <FiUser className="w-5 h-5 text-teal-500" />
                        Регистрация
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* 2. Нижняя панель навигации (Только для мобильных, md:hidden) */}
      <BottomNav isLoggedIn={isLoggedIn} navigate={navigate} />
    </>
  );
};

export default Navbar;