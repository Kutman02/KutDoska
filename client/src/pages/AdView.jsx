// src/pages/AdView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiLoader, FiTag, FiMapPin, FiArrowLeft, FiCalendar } from 'react-icons/fi'; // Добавлена FiCalendar

const AdView = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. 🌐 ФУНКЦИЯ ЗАГРУЗКИ ДЕТАЛЕЙ ОБЪЯВЛЕНИЯ
  useEffect(() => {
    const fetchAdDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/ads/${id}`);
        
        if (!response.ok) {
          throw new Error('Объявление не найдено или произошла ошибка сервера.');
        }

        const data = await response.json();
        setAd(data);
      } catch (error) {
        console.error("Ошибка при получении объявления:", error);
        toast.error(error.message);
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdDetails();
    }
  }, [id]);

  // Стилизация загрузки и ошибки
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <FiLoader className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-xl text-gray-700">
          Загрузка объявления...
        </p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Объявление не найдено
        </h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition font-medium p-3 rounded-xl bg-white shadow-md hover:shadow-lg"
        >
          <FiArrowLeft /> Вернуться на главную
        </button>
      </div>
    );
  }

  // 2. 🖼️ ОСНОВНОЕ ОТОБРАЖЕНИЕ
  return (
    <>
      <Toaster position="top-right" />
      {/* Фон всей страницы: светло-серый */}
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        {/* Главный контейнер: Чистый белый, сильное скругление, выраженная тень */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl shadow-gray-300/60 p-6 md:p-10">

          {/* Кнопка Назад: Стиль Soft UI */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition mb-8 font-semibold 
                       bg-gray-100 p-2.5 rounded-xl shadow-md hover:shadow-lg hover:bg-white"
          >
            <FiArrowLeft className="w-5 h-5" /> Назад
          </button>

          {/* Изображение */}
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              // Скругленные углы и более мягкая тень
              className="w-full max-h-[30rem] object-cover rounded-2xl mb-8 shadow-xl shadow-gray-400/40"
            />
          )}

          {/* Заголовок и цена */}
          <header className="mb-8 border-b pb-4 border-gray-100">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
              {ad.title}
            </h1>
            {/* Усиление цены */}
            <p className="text-4xl font-extrabold text-teal-600 tracking-wide">
              {ad.price} сом
            </p>
          </header>

          {/* Местоположение и дата */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <FiMapPin className="w-6 h-6 text-teal-500" />
              <span className="text-lg font-medium">{ad.location || 'Местоположение не указано'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="w-6 h-6 text-gray-400" />
              <span className="text-sm">Опубликовано: {new Date(ad.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Описание */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-teal-500/30 pb-2">
              Подробное описание
            </h2>
            <div
              className="text-gray-700 leading-relaxed text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: ad.content }}
            />
          </section>

          {/* Теги */}
          {ad.tags && ad.tags.length > 0 && (
            <footer className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 flex-wrap">
                <FiTag className="w-6 h-6 text-teal-500" />
                {ad.tags.map((tag, index) => (
                  <span
                    key={index}
                    // Стиль тегов: скругленные, светлый фон с акцентом
                    className="text-sm bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full font-semibold transition hover:bg-teal-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </footer>
          )}
        </div>
      </div>
    </>
  );
};

export default AdView;