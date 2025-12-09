import express from "express";
import {
  getAds,
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

// 2. 🔒 ЛИЧНЫЕ МАРШРУТЫ (ТРЕБУЮТ АУТЕНТИФИКАЦИИ)

// GET /api/ads (личные объявления пользователя) и POST /api/ads (создание)
adsRouter.route("/").get(protect, getAds).post(protect, createAd);

// 3. 🔍 МАРШРУТ ДЛЯ ОДНОГО ОБЪЯВЛЕНИЯ
adsRouter
  .route("/:id")
  // ✅ ИСПРАВЛЕНО: УБРАН 'protect' для GET. Теперь контроллер getAdById 
  // может обрабатывать публичные запросы (если объявление не черновик).
  .get(getAdById) 
  .put(protect, updateAd) // 🔒 PUT остается защищенным
  .delete(protect, deleteAd); // 🔒 DELETE остается защищенным

export default adsRouter;