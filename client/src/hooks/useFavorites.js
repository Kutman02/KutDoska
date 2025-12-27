// src/hooks/useFavorites.js
import { useState, useEffect, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// Предполагаем, что у вас есть AuthContext для проверки аутентификации
import { AuthContext } from '../context/AuthContext'; 

const useFavorites = () => {
    // Хранит ID объявлений, которые находятся в избранном
    const [favoriteIds, setFavoriteIds] = useState(new Set()); 
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext); // Получаем данные пользователя
    const navigate = useNavigate();

    // 1. Загрузка избранных ID
    const fetchFavoriteIds = useCallback(async () => {
        if (!user) {
            setFavoriteIds(new Set());
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:8080/api/favorites", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Не удалось загрузить избранные ID");

            const data = await response.json();
            // Получаем список ID и преобразуем в Set для быстрого поиска
            const ids = new Set(data.map(ad => ad._id)); 
            setFavoriteIds(ids);

        } catch (err) {
            console.error(err.message);
            // Ошибку тут не показываем, чтобы не спамить тостами при каждой загрузке страницы
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFavoriteIds();
    }, [fetchFavoriteIds]);

    // 2. Добавление/Удаление из избранного
    const toggleFavorite = useCallback(async (adId) => {
        if (!user) {
            toast.error("Войдите в систему, чтобы добавить в избранное.");
            navigate("/login");
            return;
        }

        const isCurrentlyFavorite = favoriteIds.has(adId);
        const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
        const endpoint = `http://localhost:8080/api/favorites/${adId}`;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Ошибка операции с избранным`);

            // Обновляем локальное состояние
            setFavoriteIds(prevIds => {
                const newIds = new Set(prevIds);
                if (isCurrentlyFavorite) {
                    newIds.delete(adId);
                    toast.success("Удалено из избранного");
                } else {
                    newIds.add(adId);
                    toast.success("Добавлено в избранное!");
                }
                // Отправляем событие для обновления счетчика в Navbar
                window.dispatchEvent(new Event('favoritesUpdated'));
                return newIds;
            });
            
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Ошибка операции с избранным.");
        }
    }, [favoriteIds, user, navigate]);

    // 3. Проверка статуса
    const isFavorite = useCallback((adId) => {
        return favoriteIds.has(adId);
    }, [favoriteIds]);

    return { 
        favoriteIds, 
        isFavorite, 
        toggleFavorite, 
        loading,
        refetchFavorites: fetchFavoriteIds // Для обновления списка на странице Favorites
    };
};

export default useFavorites;