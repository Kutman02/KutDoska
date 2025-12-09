// src/pages/AdView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiLoader, FiTag, FiMapPin, FiArrowLeft } from 'react-icons/fi'; // Импорт иконок

const AdView = () => {
  const { id } = useParams(); // Получаем ID объявления из URL
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. 🌐 ФУНКЦИЯ ЗАГРУЗКИ ДЕТАЛЕЙ ОБЪЯВЛЕНИЯ
  useEffect(() => {
    const fetchAdDetails = async () => {
      setLoading(true);
      try {
        // Используем ID, полученный из URL
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-white dark:bg-gray-950">
        <FiLoader className="w-8 h-8 text-teal-500 animate-spin mb-4" />
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Загрузка объявления...
        </p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Объявление не найдено
        </h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-teal-500 hover:text-teal-600 transition"
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
      <div className="min-h-[calc(100vh-4rem)] p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-10">

          <button
            onClick={() => navigate(-1)} // Возврат на предыдущую страницу
            className="flex items-center gap-2 text-teal-500 hover:text-teal-600 transition mb-6 font-medium"
          >
            <FiArrowLeft /> Назад
          </button>

          {/* Изображение */}
          {ad.imageUrl && (
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full max-h-96 object-cover rounded-lg mb-8 shadow-lg"
            />
          )}

          {/* Заголовок и цена */}
          <header className="mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              {ad.title}
            </h1>
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {ad.price} сом
            </p>
          </header>

          {/* Местоположение и дата */}
          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-teal-500" />
              <span>{ad.location || 'Местоположение не указано'}</span>
            </div>
            <div className="text-sm">
              Опубликовано: {new Date(ad.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Описание */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Подробное описание
            </h2>
            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed quill-content"
              // Используем dangerouslySetInnerHTML, так как контент, вероятно, из Quill
              dangerouslySetInnerHTML={{ __html: ad.content }}
            />
          </section>

          {/* Теги */}
          {ad.tags && ad.tags.length > 0 && (
            <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 flex-wrap">
                <FiTag className="w-5 h-5 text-teal-500" />
                {ad.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full font-medium"
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