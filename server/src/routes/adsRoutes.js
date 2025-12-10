import express from "express";
import {
  getMyAds, 
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getPublicAds,
  // 💡 НОВЫЕ ФУНКЦИИ КОНТРОЛЛЕРА
  searchAds, 
  getFeaturedAds,
} from "../controllers/adController.js";
import { protect } from "../middleware/authMiddleware.js";

const adsRouter = express.Router();

// 1. 🌐 ПУБЛИЧНЫЕ МАРШРУТЫ (ЛЕНТА, ПОИСК, ИЗБРАННОЕ)

// GET /api/ads/latest (Получение последних объявлений)
adsRouter.route("/latest").get(getPublicAds); 

// 🆕 GET /api/ads/search?q=query (Полнотекстовый поиск)
adsRouter.route("/search").get(searchAds);

// 🆕 GET /api/ads/featured (Избранные/Продвигаемые объявления)
adsRouter.route("/featured").get(getFeaturedAds);


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