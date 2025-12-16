// src/controllers/favoriteController.js
import Favorite from '../models/Favorite.js';
import Ad from '../models/Ad.js'; // Предполагаем, что у вас есть модель Ad

// @desc    Добавить объявление в избранное
// @route   POST /api/favorites/:adId
// @access  Private (Требуется аутентификация)
export const addFavorite = async (req, res) => {
    try {
        const adId = req.params.adId;
        const userId = req.user._id; // Получаем ID пользователя из токена (от protect middleware)

        // Проверяем, существует ли объявление
        const adExists = await Ad.findById(adId);
        if (!adExists) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }
        
        // Проверяем, не добавлено ли уже в избранное
        const existingFavorite = await Favorite.findOne({ user: userId, ad: adId });
        if (existingFavorite) {
            return res.status(200).json({ message: 'Объявление уже в избранном' });
        }

        // Создаем новую запись
        const favorite = await Favorite.create({
            user: userId,
            ad: adId,
        });

        res.status(201).json({ 
            message: 'Объявление успешно добавлено в избранное', 
            favoriteId: favorite._id 
        });

    } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// @desc    Удалить объявление из избранного
// @route   DELETE /api/favorites/:adId
// @access  Private
export const removeFavorite = async (req, res) => {
    try {
        const adId = req.params.adId;
        const userId = req.user._id;

        // Ищем и удаляем запись
        const result = await Favorite.deleteOne({ user: userId, ad: adId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Запись не найдена в избранном' });
        }

        res.status(200).json({ message: 'Объявление успешно удалено из избранного' });

    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// @desc    Получить все избранные объявления пользователя
// @route   GET /api/favorites
// @access  Private
export const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        // Находим все записи избранного и "загружаем" полную информацию об объявлении (populate)
        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'ad',
                // Выбираем только нужные поля объявления
                select: 'title price location images createdAt imageUrl content tags category user', 
            })
            .sort({ createdAt: -1 }); 

        // Извлекаем только объекты объявлений и фильтруем объявления, которые могли быть удалены
        const favoriteAds = favorites
            .filter(fav => fav.ad !== null) // Удаляем записи, если объявление уже удалено
            .map(fav => ({
                ...fav.ad._doc,
                isFavorite: true, // Фронтенд увидит, что это избранное
            }));
        

        res.json(favoriteAds);

    } catch (error) {
        console.error('Ошибка при получении избранного:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};