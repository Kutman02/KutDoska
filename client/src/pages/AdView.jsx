// src/pages/AdView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiLoader, FiTag, FiMapPin, FiArrowLeft, FiCalendar, FiPhone, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // Добавлена FiCalendar

const AdView = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  // Минимальное расстояние для свайпа
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !ad?.images) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && ad.images.length > 1) {
      setCurrentImageIndex(
        currentImageIndex === ad.images.length - 1 ? 0 : currentImageIndex + 1
      );
    }
    if (isRightSwipe && ad.images.length > 1) {
      setCurrentImageIndex(
        currentImageIndex === 0 ? ad.images.length - 1 : currentImageIndex - 1
      );
    }
  };

  // Обработка клавиатурной навигации
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!ad?.images || ad.images.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex(
          currentImageIndex === 0 ? ad.images.length - 1 : currentImageIndex - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex(
          currentImageIndex === ad.images.length - 1 ? 0 : currentImageIndex + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [ad, currentImageIndex]);

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
        // Сбрасываем индекс изображения при загрузке нового объявления
        setCurrentImageIndex(0);
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

          {/* Галерея изображений с прокруткой */}
          {((ad.images && ad.images.length > 0) || ad.imageUrl) && (
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-xl shadow-gray-400/40 bg-gray-100">
              {/* Основное изображение */}
              <div 
                className="relative w-full h-[30rem] overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={
                    ad.images && ad.images.length > 0
                      ? ad.images[currentImageIndex]
                      : ad.imageUrl
                  }
                  alt={ad.title}
                  className="w-full h-full object-contain bg-white select-none"
                  draggable={false}
                />
                
                {/* Навигация по изображениям (только если больше 1 изображения) */}
                {ad.images && ad.images.length > 1 && (
                  <>
                    {/* Кнопка "Назад" */}
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === 0
                            ? ad.images.length - 1
                            : currentImageIndex - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all shadow-lg z-10"
                      aria-label="Предыдущее изображение"
                    >
                      <FiChevronLeft className="w-6 h-6" />
                    </button>
                    
                    {/* Кнопка "Вперед" */}
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          currentImageIndex === ad.images.length - 1
                            ? 0
                            : currentImageIndex + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all shadow-lg z-10"
                      aria-label="Следующее изображение"
                    >
                      <FiChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Индикатор текущего изображения */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Миниатюры изображений (если больше 1 изображения) */}
              {ad.images && ad.images.length > 1 && (
                <div className="flex gap-2 p-4 bg-white overflow-x-auto scrollbar-hide">
                  {ad.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-teal-500 shadow-lg"
                          : "border-gray-200 hover:border-teal-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${ad.title} - изображение ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
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

          {/* Местоположение, телефон и дата */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <FiMapPin className="w-6 h-6 text-teal-500" />
              <span className="text-lg font-medium">{ad.location || 'Местоположение не указано'}</span>
            </div>
            {ad.phone && (
              <div className="flex items-center gap-2">
                <FiPhone className="w-6 h-6 text-teal-500" />
                <a 
                  href={`tel:${ad.phone}`}
                  className="text-lg font-medium text-teal-600 hover:text-teal-700 hover:underline transition"
                >
                  {ad.phone}
                </a>
              </div>
            )}
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