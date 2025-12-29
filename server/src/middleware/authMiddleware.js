// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// 1. requireSignIn (Проверка токена и аутентификация)
export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "Не авторизован (токен отсутствует)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверка подключения к MongoDB перед запросом
    if (mongoose.connection.readyState !== 1) {
        console.error("⚠️ MongoDB не подключен. Состояние:", mongoose.connection.readyState);
        return res.status(503).json({ 
            message: "Сервис временно недоступен. Проблемы с подключением к базе данных." 
        });
    }
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    // Различаем типы ошибок
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        console.error("Ошибка токена (JWT):", err.message);
        return res.status(401).json({ message: "Неверный или просроченный токен" });
    }
    
    // Ошибки подключения к MongoDB
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkTimeoutError') {
        console.error("Ошибка подключения к MongoDB:", err.message);
        return res.status(503).json({ 
            message: "Сервис временно недоступен. Проблемы с подключением к базе данных." 
        });
    }
    
    // Другие ошибки
    console.error("Ошибка токена:", err);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
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