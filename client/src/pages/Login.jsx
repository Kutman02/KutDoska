// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiLogIn, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState({ show: false, message: "", success: false });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Ошибка входа. Проверьте данные.");

      login(data); // Store in context + localStorage
      setModal({ show: true, message: "Вход успешен! Добро пожаловать.", success: true });
      localStorage.setItem("token", data.token); // Store token in localStorage

      setTimeout(() => {
        setModal({ show: false, message: "", success: false });
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setModal({ show: true, message: err.message, success: false });
      setTimeout(() => setModal({ show: false, message: "", success: false }), 3000);
      setLoading(false);
    }
  };

  return (
    // 💡 Новый контейнер: двухсторонний макет
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative">
        
      {/* 1. Модальное окно (Notification Bar) */}
      {modal.show && (
        <div className={`absolute top-0 w-full z-50 transition-all duration-300 ${modal.success ? "bg-green-600" : "bg-red-600"} p-4 flex items-center justify-center shadow-lg`}>
          {modal.success ? <FiCheckCircle className="w-5 h-5 mr-2" /> : <FiAlertTriangle className="w-5 h-5 mr-2" />}
          <span className="text-white font-medium">{modal.message}</span>
        </div>
      )}

      {/* 2. Левая акцентная сторона (Декоративная) */}
      <div className="hidden lg:flex w-full lg:w-1/2 h-screen items-center justify-center bg-teal-600 dark:bg-teal-800 p-12 relative overflow-hidden">
        {/* Декоративные геометрические фигуры */}
        <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="50" cy="50" r="40" />
                <rect x="10" y="10" width="80" height="80" />
            </svg>
        </div>
        <div className="z-10 text-center">
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-wider">
                ADBOARD ВХОД
            </h1>
            <p className="text-white text-xl font-light">
                Ваш безопасный портал для управления объявлениями.
            </p>
        </div>
      </div>
      
      {/* 3. Правая сторона (Форма входа) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 h-screen">
          <form
            onSubmit={handleLogin}
            className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-white border-b pb-3 border-teal-400/50">
              Авторизация
            </h2>
            
            {/* Email */}
            <div className="relative mb-5">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Электронная почта"
                className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-300 dark:border-gray-700 focus:border-teal-500 rounded-none dark:bg-gray-700 dark:text-white focus:outline-none transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {/* Password */}
            <div className="relative mb-8">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Пароль"
                className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-300 dark:border-gray-700 focus:border-teal-500 rounded-none dark:bg-gray-700 dark:text-white focus:outline-none transition duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-lg font-bold text-lg shadow-xl shadow-teal-500/30 hover:bg-teal-700 transition duration-300 transform hover:scale-[1.01]"
            >
              <FiLogIn className="w-5 h-5" />
              {loading ? "Выполняется вход..." : "Войти в систему"}
            </button>
            
            {/* Link to Register */}
            <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                Нет аккаунта?{" "}
                <Link to="/register" className="text-teal-600 dark:text-teal-400 font-medium hover:underline transition">
                    Зарегистрироваться
                </Link>
            </p>
          </form>
      </div>
    </div>
  );
};

export default Login;