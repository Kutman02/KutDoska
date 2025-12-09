import express from "express";
import {
  getMyAds, // 💡 Используем getMyAds
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getPublicAds,
} from "../controllers/adController.js";
import { protect } from "../middleware/authMiddleware.js";

const adsRouter = express.Router();

// 1. 🌐 ПУБЛИЧНЫЙ МАРШРУТ (ЛЕНТА)
// GET /api/ads/latest (Получение последних объявлений)
adsRouter.route("/latest").get(getPublicAds);

// 2. 🔒 ЛИЧНЫЕ МАРШРУТЫ ПОЛЬЗОВАТЕЛЯ
// GET /api/ads/my (Получение объявлений текущего пользователя)
adsRouter.route("/my").get(protect, getMyAds); 

// 3. 🔒 УПРАВЛЕНИЕ ОБЪЯВЛЕНИЯМИ
// POST /api/ads (создание)
adsRouter.route("/").post(protect, createAd);

// 4. 🔍 МАРШРУТ ДЛЯ ОДНОГО ОБЪЯВЛЕНИЯ
adsRouter
  .route("/:id")
  .get(getAdById) 
  .put(protect, updateAd) 
  .delete(protect, deleteAd); 

export default adsRouter;