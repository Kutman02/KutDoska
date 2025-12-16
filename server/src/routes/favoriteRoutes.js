// src/routes/favoriteRoutes.js
import express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favoriteController.js';
// Предполагаем, что protect находится тут, как и в adsRoutes.js
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Все маршруты требуют аутентификации

// GET /api/favorites - Получить все избранные объявления
router.get('/', protect, getFavorites);

// POST /api/favorites/:adId - Добавить объявление в избранное
router.post('/:adId', protect, addFavorite);

// DELETE /api/favorites/:adId - Удалить объявление из избранного
router.delete('/:adId', protect, removeFavorite);


export default router;