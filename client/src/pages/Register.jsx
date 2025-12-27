// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, clearError } from "../store/slices/authSlice";
import { FiUser, FiMail, FiLock, FiEdit3, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", success: false });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      setModal({ show: true, message: error, success: false });
      setTimeout(() => {
        setModal({ show: false, message: "", success: false });
        dispatch(clearError());
      }, 3000);
    }
  }, [error, dispatch]);

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(registerUser({ name, email, password }));
    
    if (registerUser.fulfilled.match(result)) {
      setModal({ show: true, message: "Регистрация успешна! Теперь войдите.", success: true });
      setTimeout(() => {
        setModal({ show: false, message: "", success: false });
        navigate("/login");
      }, 2000);
    }
  };

  return (
    // Общий светлый фон
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      
      {/* 1. Модальное окно (Notification Bar) */}
      {modal.show && (
        <div className={`absolute top-0 w-full z-50 transition-all duration-300 ${modal.success ? "bg-green-500" : "bg-red-500"} p-4 flex items-center justify-center shadow-xl`}>
          {modal.success ? <FiCheckCircle className="w-5 h-5 mr-2 text-white" /> : <FiAlertTriangle className="w-5 h-5 mr-2 text-white" />}
          <span className="text-white font-medium">{modal.message}</span>
        </div>
      )}

      {/* 2. Левая акцентная сторона (Декоративная) */}
      <div className="hidden lg:flex w-full lg:w-1/2 h-screen items-center justify-center bg-teal-600 p-12 relative overflow-hidden shadow-2xl">
        {/* Декоративные фигуры (мягкий цвет) */}
        <div className="absolute inset-0 opacity-15 text-teal-400">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M50 10 L90 50 L50 90 L10 50 Z" /> 
                <circle cx="50" cy="50" r="15" />
            </svg>
        </div>
        <div className="z-10 text-center">
            <h1 className="text-5xl font-extrabold text-white mb-4 tracking-wider">
                ПРИСОЕДИНИТЬСЯ
            </h1>
            <p className="text-teal-100 text-xl font-light">
                Создайте свой аккаунт и начните публиковать объявления!
            </p>
        </div>
      </div>
      
      {/* 3. Правая сторона (Форма регистрации - Soft UI) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 h-screen">
          <form
            onSubmit={handleRegister}
            // Форма: сильное скругление, мягкая тень
            className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl shadow-gray-300/60 w-full max-w-md"
          >
            <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 border-b pb-3 border-teal-500/50">
              Создание Аккаунта
            </h2>
            
            {/* Name (Soft UI Input) */}
            <div className="relative mb-5">
              <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
              <input
                type="text"
                placeholder="Ваше Имя"
                // Стиль Soft UI: скругление, легкий фон, shadow-inner, фокус-кольцо
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border border-transparent 
                           focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                           text-gray-800 transition duration-200 shadow-inner placeholder-gray-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email (Soft UI Input) */}
            <div className="relative mb-5">
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
            
            {/* Password (Soft UI Input) */}
            <div className="relative mb-8">
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

            {/* Submit Button (Акцентная Soft UI) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-2xl font-bold text-lg 
                       shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition duration-300 transform hover:-translate-y-1 disabled:opacity-50"
            >
              <FiEdit3 className="w-5 h-5" />
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
            
            {/* Link to Login */}
            <p className="mt-6 text-center text-gray-600 text-sm">
                Уже есть аккаунт?{" "}
                <Link to="/login" className="text-teal-600 font-semibold hover:underline transition">
                    Войти
                </Link>
            </p>
          </form>
      </div>
    </div>
  );
};

export default Register;