// src/privateRoutes/PrivateRoute.tsx
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setUser, openLoginModal } from "../store/slices/authSlice";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [checking, setChecking] = useState(true);

  // Восстанавливаем пользователя из localStorage, если токен есть,
  // но store еще не успел подтянуть данные (частый кейс при F5).
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          dispatch(setUser(JSON.parse(storedUser)));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
    setChecking(false);
  }, [user, dispatch]);

  // Если нет токена, открываем модальное окно входа
  useEffect(() => {
    if (!token && !checking) {
      dispatch(openLoginModal());
    }
  }, [token, checking, dispatch]);

  // Пока проверяем, показываем короткий лоадер, чтобы не дергать роутер.
  if (checking) {
    return (
      <div className="w-full min-h-[40vh] flex items-center justify-center text-teal-600 font-semibold">
        Проверяем авторизацию...
      </div>
    );
  }

  return token ? children : null;
};

export default PrivateRoute;
