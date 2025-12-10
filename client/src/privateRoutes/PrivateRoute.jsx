// src/components/PrivateRoute.jsx
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, setUser } = useContext(AuthContext);
  const [checking, setChecking] = useState(true);
  const token = localStorage.getItem("token"); // или берем из AuthContext

  // Восстанавливаем пользователя из localStorage, если токен есть,
  // но контекст еще не успел подтянуть данные (частый кейс при F5).
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
    setChecking(false);
  }, [user, setUser]);

  // Пока проверяем, показываем короткий лоадер, чтобы не дергать роутер.
  if (checking) {
    return (
      <div className="w-full min-h-[40vh] flex items-center justify-center text-teal-600 font-semibold">
        Проверяем авторизацию...
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
