// src/hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite as toggleFavoriteAction, fetchFavorites } from '../store/slices/favoritesSlice';

const useFavorites = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { favoriteIds: storeFavoriteIds } = useAppSelector((state) => state.favorites);
    const [favoriteIds, setFavoriteIds] = useState(new Set(storeFavoriteIds)); 
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Синхронизация с store
    useEffect(() => {
        setFavoriteIds(new Set(storeFavoriteIds));
    }, [storeFavoriteIds]);

    // 1. Загрузка избранных ID
    const fetchFavoriteIds = useCallback(async () => {
        if (!user) {
            setFavoriteIds(new Set());
            return;
        }

        setLoading(true);
        try {
            const result = await dispatch(fetchFavorites());
            if (fetchFavorites.fulfilled.match(result)) {
                const ids = new Set(result.payload.map(ad => ad._id));
                setFavoriteIds(ids);
            }
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, dispatch]);

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
        
        try {
            const result = await dispatch(toggleFavoriteAction(adId));
            
            if (toggleFavoriteAction.fulfilled.match(result)) {
                const newIds = new Set(favoriteIds);
                if (isCurrentlyFavorite) {
                    newIds.delete(adId);
                    toast.success("Удалено из избранного");
                } else {
                    newIds.add(adId);
                    toast.success("Добавлено в избранное!");
                }
                setFavoriteIds(newIds);
            } else {
                toast.error(result.payload || "Ошибка операции с избранным.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Ошибка операции с избранным.");
        }
    }, [favoriteIds, user, navigate, dispatch]);

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