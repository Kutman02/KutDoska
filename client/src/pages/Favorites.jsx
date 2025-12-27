// src/pages/Favorites.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AdCard from "../components/AdCard";
import { FiHeart, FiLoader, FiBookOpen } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchFavorites } from "../store/slices/favoritesSlice";

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

  // Обработчик удаления, который обновляет локальное состояние
  const handleToggleFavorite = async (adId) => {
    // Обновляем список на странице после удаления
    setLocalFavoriteAds(prev => prev.filter(ad => ad._id !== adId));
    // Обновляем избранное в store
    dispatch(fetchFavorites());
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
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-screen-xl mx-auto py-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-3 flex items-center gap-3">
          <FiHeart className="w-7 h-7 text-red-500" fill="currentColor" />
          Избранные Объявления ({localFavoriteAds.length})
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {localFavoriteAds.map((ad) => {
            const fullLocation = [
              ad.locationId?.name || null,
              ad.location || null
            ]
              .filter(Boolean)
              .join(", ") || "Не указано";

            return (
              <AdCard
                key={ad._id}
                adId={ad._id} // Передаем ID
                title={ad.content || ad.title || ""}
                image={ad.images && ad.images[0] ? ad.images[0] : (ad.imageUrl || null)} 
                datePosted={new Date(ad.createdAt).toLocaleDateString('ru-RU')}
                location={fullLocation}
                price={ad.price}
                
                onCardClick={() => navigate(`/ad-view/${ad._id}`)}
                
                // На этой странице все элементы избранные (true)
                isFavorite={true} 
                onToggleFavorite={handleToggleFavorite} // Используем наш обработчик
                
                // В избранном нет кнопок редактирования/удаления объявления
                onEdit={null}
                onDelete={null}
                
                // Информация об авторе
                author={ad.user}
                onAuthorClick={(userId) => navigate(`/user/${userId}`)}
                views={ad.views}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Favorites;