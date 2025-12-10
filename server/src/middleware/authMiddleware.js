// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 1. requireSignIn (Проверка токена и аутентификация)
export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Не авторизован (токен отсутствует)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("Ошибка токена:", err);
    return res.status(401).json({ message: "Неверный или просроченный токен" });
  }
};

// 2. isAdmin (Проверка роли администратора)
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ 
            message: "Доступ запрещен. Требуются права администратора." 
        });
    }
    next();
};

// Алиас для обратной совместимости
export const protect = requireSignIn;