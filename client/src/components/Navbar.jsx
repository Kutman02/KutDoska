import { useState } from "react";
import { FiMenu, FiX, FiLogOut, FiPlusSquare, FiUser, FiHome } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  // Более строгий дизайн: теперь просто "U"
  const getInitial = () => user?.name?.[0]?.toUpperCase() || "U";

  return (
    <nav className="bg-gray-800 dark:bg-zinc-900 border-b border-teal-500/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <div
            className="text-3xl cursor-pointer tracking-widest font-light text-teal-400 hover:text-teal-300 transition duration-300"
            onClick={() => navigate("/")}
          >
            NOTE.APP
          </div>

          {/* Навигация для десктопов */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-teal-400 border-b-2 border-transparent hover:border-teal-400 pb-1 transition duration-200 flex items-center gap-1"
                >
                  <FiHome className="w-4 h-4" />
                  Панель
                </Link>
                
                {/* Кнопка с новым стилем (контурная) */}
                <Link
                  to="/create"
                  className="flex items-center gap-1 border border-teal-500 text-teal-400 px-3 py-1.5 rounded-full hover:bg-teal-500 hover:text-gray-800 transition duration-300 font-medium text-sm"
                >
                  <FiPlusSquare className="w-4 h-4" />
                  Новая заметка
                </Link>

                {/* Выпадающее меню */}
                <div className="relative">
                  {/* Иконка пользователя с новым стилем */}
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="bg-gray-700 text-teal-400 font-semibold w-9 h-9 flex items-center justify-center rounded-full cursor-pointer border-2 border-teal-400 hover:bg-teal-400 hover:text-gray-800 transition duration-300"
                  >
                    {getInitial()}
                  </div>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 shadow-xl rounded-lg overflow-hidden z-50 border border-teal-500/50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-400 hover:bg-gray-600 transition duration-200"
                      >
                        <FiLogOut className="w-5 h-5" />
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-teal-400 transition duration-200 border border-transparent hover:border-teal-400 px-3 py-1 rounded-full"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-500 text-gray-800 px-3 py-1.5 rounded-full hover:bg-teal-400 transition duration-200 font-medium"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Кнопка мобильного меню */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded hover:bg-gray-700">
              {menuOpen ? (
                <FiX className="w-6 h-6 text-teal-400" />
              ) : (
                <FiMenu className="w-6 h-6 text-teal-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-3 bg-gray-800 border-t border-teal-500/50">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                // ИСПРАВЛЕНО: удален 'block'
                className="text-gray-300 hover:text-teal-400 transition duration-200 py-2 border-b border-gray-700 flex items-center gap-2 w-full" 
                onClick={() => setMenuOpen(false)}
              >
                <FiHome className="w-5 h-5" />
                Панель инструментов
              </Link>
              <Link
                to="/create"
                // ИСПРАВЛЕНО: удален 'block'. Добавлен 'w-full' для замещения поведения block
                className="w-full bg-teal-500 text-gray-800 text-center px-4 py-2 rounded-lg hover:bg-teal-400 transition duration-300 font-medium flex items-center justify-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <FiPlusSquare className="w-5 h-5" />
                + Новая заметка
              </Link>
              <button
                onClick={handleLogout}
                // На кнопке 'Выйти' конфликта не было, так как 'block' и 'flex' не пересекались, но я оставил w-full, чтобы обеспечить блочное поведение.
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition duration-200"
              >
                <FiLogOut className="w-5 h-5" />
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                // ИСПРАВЛЕНО: удален 'block'
                className="text-gray-300 hover:text-teal-400 transition duration-200 py-2 border-b border-gray-700 flex items-center gap-2 w-full"
                onClick={() => setMenuOpen(false)}
              >
                <FiUser className="w-5 h-5" />
                Войти
              </Link>
              <Link
                to="/register"
                // ИСПРАВЛЕНО: Здесь я удалил 'block' и добавил 'w-full', чтобы обеспечить блочное поведение
                className="w-full bg-teal-500 text-gray-800 text-center px-4 py-2 rounded-lg hover:bg-teal-400 transition duration-300 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;