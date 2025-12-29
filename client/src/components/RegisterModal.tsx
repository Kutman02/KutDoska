// src/components/RegisterModal.tsx
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, clearError, closeRegisterModal, openLoginModal } from "../store/slices/authSlice";
import { FiUser, FiMail, FiLock, FiEdit3, FiAlertTriangle, FiCheckCircle, FiX } from "react-icons/fi";

interface ModalState {
  show: boolean;
  message: string;
  success: boolean;
}

const RegisterModal: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState<ModalState>({ show: false, message: "", success: false });

  const dispatch = useAppDispatch();
  const { loading, error, showRegisterModal } = useAppSelector((state) => state.auth);

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
    if (!showRegisterModal) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeRegisterModal());
        setName("");
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
  }, [showRegisterModal, dispatch]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(registerUser({ name, email, password }));
    
    if (registerUser.fulfilled.match(result)) {
      setModal({ show: true, message: "Регистрация успешна! Добро пожаловать.", success: true });
      setTimeout(() => {
        setModal({ show: false, message: "", success: false });
        dispatch(closeRegisterModal());
      }, 2000);
    }
  };

  const handleClose = () => {
    dispatch(closeRegisterModal());
    setName("");
    setEmail("");
    setPassword("");
    dispatch(clearError());
  };

  const handleSwitchToLogin = () => {
    dispatch(closeRegisterModal());
    dispatch(openLoginModal());
  };

  if (!showRegisterModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay с затемненным фоном */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Модальное окно */}
      <div className="relative bg-white dark:bg-slate-800 rounded-md w-full max-w-md p-8 sm:p-10 z-10 border border-gray-200 dark:border-slate-700">
        {/* Кнопка закрытия */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Уведомление */}
        {modal.show && (
          <div className={`mb-4 rounded-md p-4 flex items-center gap-2 ${modal.success ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
            {modal.success ? <FiCheckCircle className="w-5 h-5" /> : <FiAlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-medium">{modal.message}</span>
          </div>
        )}

        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-3">
          Создание Аккаунта
        </h2>
        
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500 dark:text-teal-400" />
            <input
              type="text"
              placeholder="Ваше Имя"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-md border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-slate-600 
                         text-gray-800 dark:text-slate-200 transition-colors placeholder-gray-500 dark:placeholder-slate-500"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500 dark:text-teal-400" />
            <input
              type="email"
              placeholder="Электронная почта"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-md border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-slate-600 
                         text-gray-800 dark:text-slate-200 transition-colors placeholder-gray-500 dark:placeholder-slate-500"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500 dark:text-teal-400" />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-md border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-slate-600 
                         text-gray-800 dark:text-slate-200 transition-colors placeholder-gray-500 dark:placeholder-slate-500"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 dark:bg-teal-500 text-white py-3 rounded-md font-bold text-lg 
                     hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            <FiEdit3 className="w-5 h-5" />
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
          
          {/* Link to Login */}
          <p className="mt-6 text-center text-gray-600 dark:text-slate-400 text-sm">
            Уже есть аккаунт?{" "}
            <button
              type="button"
              onClick={handleSwitchToLogin}
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline transition"
            >
              Войти
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;

