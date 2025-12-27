// src/components/LoginModal.jsx
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, clearError, closeLoginModal, openRegisterModal } from "../store/slices/authSlice";
import { FiMail, FiLock, FiLogIn, FiAlertTriangle, FiCheckCircle, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const LoginModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", success: false });

  const dispatch = useAppDispatch();
  const { loading, error, showLoginModal } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      setModal({ show: true, message: error, success: false });
      setTimeout(() => {
        setModal({ show: false, message: "", success: false });
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  // Закрытие по ESC
  useEffect(() => {
    if (!showLoginModal) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeLoginModal());
        setEmail("");
        setPassword("");
        dispatch(clearError());
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showLoginModal, dispatch]);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      setModal({ show: true, message: "Вход успешен! Добро пожаловать.", success: true });
      setTimeout(() => {
        setModal({ show: false, message: "", success: false });
        dispatch(closeLoginModal());
      }, 1500);
    }
  };

  const handleClose = () => {
    dispatch(closeLoginModal());
    setEmail("");
    setPassword("");
    dispatch(clearError());
  };

  const handleSwitchToRegister = () => {
    dispatch(closeLoginModal());
    dispatch(openRegisterModal());
  };

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay с затемненным фоном */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Модальное окно */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-300/60 w-full max-w-md p-8 sm:p-10 z-10 animate-in fade-in zoom-in duration-200">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Уведомление */}
        {modal.show && (
          <div className={`mb-4 rounded-xl p-4 flex items-center gap-2 ${modal.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {modal.success ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-medium">{modal.message}</span>
          </div>
        )}

        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-3 border-teal-500/50">
          Авторизация
        </h2>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
            <input
              type="email"
              placeholder="Электронная почта"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 transition duration-200 shadow-inner placeholder-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         text-gray-800 transition duration-200 shadow-inner placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-2xl font-bold text-lg 
                     shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition duration-300 transform hover:-translate-y-1 disabled:opacity-50"
          >
            <FiLogIn className="w-5 h-5" />
            {loading ? "Выполняется вход..." : "Войти в систему"}
          </button>
          
          {/* Link to Register */}
          <p className="mt-6 text-center text-gray-600 text-sm">
            Нет аккаунта?{" "}
            <button
              type="button"
              onClick={handleSwitchToRegister}
              className="text-teal-600 font-semibold hover:underline transition"
            >
              Зарегистрироваться
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

