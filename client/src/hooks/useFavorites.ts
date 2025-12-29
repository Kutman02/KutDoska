// src/hooks/useFavorites.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite as toggleFavoriteAction, fetchFavorites } from '../store/slices/favoritesSlice';
import { openLoginModal } from '../store/slices/authSlice';
import type { Ad } from '../types/ad.types';

interface UseFavoritesReturn {
    favoriteIds: Set<string>;
    isFavorite: (adId: string) => boolean;
    toggleFavorite: (adId: string) => Promise<void>;
    loading: boolean;
    refetchFavorites: () => Promise<void>;
}

const useFavorites = (): UseFavoritesReturn => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { favoriteIds: storeFavoriteIds } = useAppSelector((state) => state.favorites);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(storeFavoriteIds)); 
    const [loading, setLoading] = useState(false);

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
                const ads = result.payload as Ad[];
                const ids = new Set(ads.map((ad: Ad) => ad._id));
                setFavoriteIds(ids);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            console.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, dispatch]);

    useEffect(() => {
        fetchFavoriteIds();
    }, [fetchFavoriteIds]);

    // 2. Добавление/Удаление из избранного
    const toggleFavorite = useCallback(async (adId: string): Promise<void> => {
        if (!user) {
            toast.error("Войдите в систему, чтобы добавить в избранное.");
            dispatch(openLoginModal());
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
                const errorMessage = result.payload || "Ошибка операции с избранным.";
                toast.error(typeof errorMessage === 'string' ? errorMessage : "Ошибка операции с избранным.");
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Ошибка операции с избранным.";
            toast.error(errorMessage);
        }
    }, [favoriteIds, user, dispatch]);

    // 3. Проверка статуса
    const isFavorite = useCallback((adId: string): boolean => {
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