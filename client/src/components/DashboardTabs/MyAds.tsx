// src/components/DashboardTabs/MyAds.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdCard from "../AdCard";
import { FiGrid, FiArrowLeft, FiArrowRight, FiPlus } from "react-icons/fi";
import { useAppDispatch } from "../../store/hooks";
import { openLoginModal } from "../../store/slices/authSlice";
import type { Ad } from "../../types/ad.types";
import type { User } from "../../types/user.types";

const ADS_PER_PAGE = 10; 

// Вспомогательная функция для очистки HTML
const stripHtml = (html: unknown): string => {
    if (!html) return "";
    // Если это уже чистый текст (нет HTML тегов), возвращаем как есть
    if (typeof html !== 'string') return String(html);
    // Удаляем все HTML теги с помощью регулярного выражения
    const text = html.replace(/<[^>]*>/g, '');
    // Декодируем HTML entities
    const tmp = document.createElement("div");
    tmp.innerHTML = text;
    return tmp.textContent || tmp.innerText || text;
};

interface MyAdsProps {
  user?: User;
}

const MyAds: React.FC<MyAdsProps> = ({ user }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(openLoginModal());
        throw new Error("Токен аутентификации не найден");
      }

      const response = await fetch("http://localhost:8080/api/ads/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Не удалось загрузить объявления");

      const data = await response.json();
      setAds(data);

      // УДАЛЯЕМ: логику извлечения и установки тегов
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error(errorMessage);
      setError(errorMessage);
      if (errorMessage.includes("Authentication")) {
          dispatch(openLoginModal());
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);


  const handleDelete = async (id: string, title: string) => {
    const confirm = window.confirm(
      `Вы уверены, что хотите удалить объявление: "${title}"? Это действие необратимо!`
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/ads/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Не удалось удалить объявление");

      setAds((prev) => prev.filter((ad) => ad._id !== id));
      toast.success("Объявление успешно удалено");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error(errorMessage);
      toast.error("Не удалось удалить объявление");
    }
  };


  // ИЗМЕНЯЕМ: filteredAds теперь просто равен ads, так как нет фильтрации по поиску/тегам
  const filteredAds = ads; 

  const totalPages = Math.ceil(filteredAds.length / ADS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADS_PER_PAGE;
  const paginatedAds = filteredAds.slice(
    startIndex,
    startIndex + ADS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
  
  const handleCardClick = (id: string) => {
      navigate(`/ad-view/${id}`);
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center text-xl text-teal-600">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Загрузка объявлений...
        </div>
      </div>
    );
  }

  return (
    <>
      {ads.length === 0 && !loading && !error ? (
        // Пустое состояние объявлений
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-3xl shadow-xl shadow-gray-300/50 p-12 mt-4">
          <FiGrid className="w-16 h-16 text-teal-400 mb-6" />
          <p className="text-3xl font-bold mb-4 text-gray-800">
            У вас нет активных объявлений
          </p>
          <p className="mb-8 text-gray-600">
            Опубликуйте первое объявление, чтобы начать.
          </p>
          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold 
                       shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition transform hover:-translate-y-1"
          >
            <FiPlus /> Создать объявление
          </button>
        </div>
      ) : (
        <>
          {/* УДАЛЯЕМ: Блок фильтров (Поиск и Теги) */}
          {/* <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">...</div> */}

          {/* Отображение объявлений */}
          {filteredAds.length === 0 ? (
            // Этот блок на самом деле никогда не должен показываться, если ads.length > 0, 
            // но оставим для безопасности (если вдруг filteredAds по какой-то причине пуст)
            <div className="flex flex-col items-center justify-center text-center text-gray-600 mt-12 p-10 
                            bg-white border-2 border-dashed border-gray-300 rounded-2xl shadow-inner">
              <p className="text-xl font-semibold mb-2">Объявления не найдены.</p>
            </div>
          ) : (
            <>
              {/* Список объявлений (Сетка) */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 mt-4">
                {paginatedAds.map((ad: Ad) => {
                  // Формируем строку локации: город/район + дополнительная информация
                  const locationIdName = typeof ad.locationId === 'object' && ad.locationId !== null ? ad.locationId.name : null;
                  const locationString = [
                    locationIdName || null,
                    ad.location || null
                  ].filter(Boolean).join(", ") || "Не указано";

                  return (
                    <AdCard
                      key={ad._id}
                      adId={ad._id}
                      title={ad.content || ad.title || ""}
                      image={ad.images?.[0] || ad.imageUrl || null}
                      descriptionSnippet={stripHtml(ad.content)?.slice(0, 100) || ""}
                      datePosted={ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('ru-RU') : undefined}
                      location={locationString}
                      price={ad.price}
                      tags={ad.tags || []}
                      onCardClick={() => handleCardClick(ad._id)}
                      onEdit={() => navigate(`/edit-ad/${ad._id}`)}
                      onDelete={() => handleDelete(ad._id, stripHtml(ad.content || ad.title || "").substring(0, 30))}
                      views={ad.views}
                    />
                  );
                })}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 space-x-2">
                  <button
                    className="flex items-center gap-1 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold 
                               shadow-md hover:shadow-lg hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:shadow-none"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Предыдущая
                  </button>

                  {/* Генерация кнопок пагинации */}
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-full font-bold transition duration-200 
                                  ${currentPage === i + 1
                                    ? "bg-teal-500 text-white shadow-lg shadow-teal-300/50" 
                                    : "bg-white text-gray-800 hover:bg-teal-50 hover:ring-2 hover:ring-teal-200 shadow-md"
                                  }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="flex items-center gap-1 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold 
                               shadow-md hover:shadow-lg hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:shadow-none"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Следующая
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default MyAds;