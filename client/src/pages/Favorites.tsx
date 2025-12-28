// src/pages/Favorites.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AdCard from "../components/AdCard";
import { FiHeart, FiLoader, FiBookOpen } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchFavorites } from "../store/slices/favoritesSlice";
import useFavorites from "../hooks/useFavorites";
import type { Ad } from "../types/ad.types";

const Favorites: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { favorites: favoriteAds, loading: loadingContent } = useAppSelector((state) => state.favorites);
  const [localFavoriteAds, setLocalFavoriteAds] = useState<Ad[]>([]); 
  const navigate = useNavigate();
  
  // Используем хук, чтобы получить управление избранным
  const { toggleFavorite } = useFavorites(); 

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [user, dispatch]);

  useEffect(() => {
    // favorites возвращает Ad[] напрямую из API (см. favoritesSlice.ts - fetchFavorites возвращает Ad[])
    setLocalFavoriteAds(favoriteAds);
  }, [favoriteAds]);

  // Обработчик удаления из избранного
  const handleToggleFavorite = async (adId: string) => {
    // Используем toggleFavorite из хука
    await toggleFavorite(adId);
    // Обновляем локальное состояние после удаления
    setLocalFavoriteAds(prev => prev.filter(ad => ad._id !== adId));
  };


  // --- Отображение состояний ---
  if (loadingContent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <div className="bg-white rounded-2xl shadow-xl shadow-rose-100/50 p-8 flex items-center">
          <FiLoader className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-xl text-gray-700 ml-3">Загрузка избранного...</p>
        </div>
      </div>
    );
  }
  
  if (localFavoriteAds.length === 0 && !loadingContent) {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
            <div className="bg-white rounded-2xl shadow-xl shadow-rose-100/50 p-12 max-w-md">
                <FiHeart className="w-16 h-16 text-red-400 mb-4 mx-auto" />
                <h1 className="text-3xl font-bold mb-4 text-gray-800">
                    Ваш список избранного пуст
                </h1>
                <p className="text-xl mb-8 text-gray-600">
                    Добавляйте объявления, чтобы не потерять их!
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 bg-red-500 text-white px-8 py-4 rounded-xl text-lg font-semibold 
                                hover:bg-red-600 transition-colors shadow-lg shadow-red-200/50 mx-auto"
                >
                    <FiBookOpen className="w-5 h-5" />
                    Перейти к объявлениям
                </button>
            </div>
        </div>
    );
  }


  // --- ОСНОВНОЕ ОТОБРАЖЕНИЕ ---
  return (
    <div className="min-h-screen w-full pb-20 md:pb-0 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      <Toaster position="top-right" />
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Карточка контента с белым фоном и тенью */}
        <div className="bg-white rounded-2xl shadow-xl shadow-rose-100/50 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 md:mb-8 border-b-2 border-rose-200 pb-3 md:pb-4 flex items-center gap-2 md:gap-3">
            <FiHeart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-500" fill="currentColor" />
            <span>Избранные Объявления</span>
            <span className="text-base sm:text-lg md:text-xl text-gray-600 font-normal">({localFavoriteAds.length})</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {localFavoriteAds.map((ad: Ad) => {
              const categoryName = typeof ad.subcategory === 'object' && ad.subcategory !== null 
                ? ad.subcategory.name 
                : typeof ad.category === 'object' && ad.category !== null 
                  ? ad.category.name 
                  : "";
              const author = typeof ad.user === 'object' && ad.user !== null ? ad.user : undefined;
              return (
                <AdCard
                  key={ad._id}
                  adId={ad._id}
                  title={ad.content || ad.title || ""}
                  image={ad.images && ad.images[0] ? ad.images[0] : (ad.imageUrl || null)} 
                  price={ad.price}
                  categoryName={categoryName}
                  onCardClick={() => navigate(`/ad-view/${ad._id}`)}
                  isFavorite={true} 
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={null}
                  onDelete={null}
                  author={author}
                  onAuthorClick={(userId) => navigate(`/user/${userId}`)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;