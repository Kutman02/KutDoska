// src/pages/Favorites.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AdCard from "../components/AdCard";
import { FiHeart, FiLoader, FiBookOpen } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchFavorites } from "../store/slices/favoritesSlice";
import useFavorites from "../hooks/useFavorites";

const Favorites = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { favorites: favoriteAds, loading: loadingContent } = useAppSelector((state) => state.favorites);
  const [localFavoriteAds, setLocalFavoriteAds] = useState([]); 
  const navigate = useNavigate();
  
  // Используем хук, чтобы получить управление избранным
  const { isFavorite, toggleFavorite, refetchFavorites } = useFavorites(); 

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [user, dispatch]);

  useEffect(() => {
    setLocalFavoriteAds(favoriteAds);
  }, [favoriteAds]);

  // Обработчик удаления из избранного
  const handleToggleFavorite = async (adId) => {
    // Используем toggleFavorite из хука
    await toggleFavorite(adId);
    // Обновляем локальное состояние после удаления
    setLocalFavoriteAds(prev => prev.filter(ad => ad._id !== adId));
  };


  // --- Отображение состояний ---
  if (loadingContent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-xl text-gray-700 ml-3">Загрузка избранного...</p>
      </div>
    );
  }
  
  if (localFavoriteAds.length === 0 && !loadingContent) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center bg-gray-50 p-8">
            <FiHeart className="w-16 h-16 text-teal-400 mb-4 shadow-md rounded-full p-2 bg-white" />
            <h1 className="text-3xl font-bold mb-4 text-gray-800">
                Ваш список избранного пуст
            </h1>
            <p className="text-xl mb-8 text-gray-600">
                Добавляйте объявления, чтобы не потерять их!
            </p>
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold 
                            shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition transform hover:-translate-y-1"
            >
                <FiBookOpen className="w-5 h-5" />
                Перейти к объявлениям
            </button>
        </div>
    );
  }


  // --- ОСНОВНОЕ ОТОБРАЖЕНИЕ ---
  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 md:mb-8 border-b pb-2 md:pb-3 flex items-center gap-2 md:gap-3">
          <FiHeart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-500" fill="currentColor" />
          <span>Избранные Объявления</span>
          <span className="text-base sm:text-lg md:text-xl text-gray-600 font-normal">({localFavoriteAds.length})</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {localFavoriteAds.map((ad) => {
            return (
              <AdCard
                key={ad._id}
                adId={ad._id}
                title={ad.content || ad.title || ""}
                image={ad.images && ad.images[0] ? ad.images[0] : (ad.imageUrl || null)} 
                price={ad.price}
                categoryName={ad.subcategory?.name || ad.category?.name || ""}
                onCardClick={() => navigate(`/ad-view/${ad._id}`)}
                isFavorite={true} 
                onToggleFavorite={handleToggleFavorite}
                onEdit={null}
                onDelete={null}
                author={ad.user}
                onAuthorClick={(userId) => navigate(`/user/${userId}`)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Favorites;