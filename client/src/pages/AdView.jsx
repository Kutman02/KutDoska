// src/pages/AdView.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FiLoader, FiTag, FiMapPin, FiArrowLeft, FiCalendar, 
  FiPhone, FiChevronLeft, FiChevronRight, FiMaximize2, FiX, FiUser, FiEye
} from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';

// ====================================================================
// --- 1. КОМПОНЕНТ МОДАЛЬНОГО ОКНА ДЛЯ ПОЛНОЭКРАННОГО ПРОСМОТРА ---
// Масштабирование: Убран max-h-full, чтобы изображение могло быть больше экрана.
// ====================================================================

const FullscreenImageModal = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  // Логика свайпа, клавиатуры и остальное остаются прежними...
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    }
    if (isRightSwipe) {
      onPrev();
    }
  };
  
  const handleKeyModal = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      onPrev();
    } else if (e.key === 'ArrowRight') {
      onNext();
    }
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyModal);
    return () => window.removeEventListener('keydown', handleKeyModal);
  }, [handleKeyModal]);

  if (!images || images.length === 0) return null;
  const currentImageSrc = images[currentIndex];
  const totalImages = images.length;

  return (
    // Модальное окно: теперь имеет scroll (overflow-auto) для масштабирования
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4 overflow-auto cursor-grab">
      
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-red-400 p-2 transition z-50"
        aria-label="Закрыть полноэкранный просмотр"
      >
        <FiX className="w-8 h-8" />
      </button>

      {/* Контейнер изображения: позволяет контенту быть больше, чем viewport */}
      <div 
        className="relative min-w-full min-h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImageSrc}
          alt={`Полноэкранное изображение ${currentIndex + 1}`}
          // Убраны max-w-full max-h-full, чтобы браузер мог масштабировать
          className="object-contain select-none"
          draggable={false}
        />
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>

      {totalImages > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-xl transition-all shadow-lg z-50 hidden sm:block"
            aria-label="Предыдущее изображение"
          >
            <FiChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-xl transition-all shadow-lg z-50 hidden sm:block"
            aria-label="Следующее изображение"
          >
            <FiChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
    </div>
  );
};

// ====================================================================
// --- 2. ГЛАВНЫЙ КОМПОНЕНТ ADVIEW ---
// ====================================================================

const AdView = () => {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  const minSwipeDistance = 50;
  const totalImages = ad?.images?.length || 0;
  
  // Функции навигации остаются прежними...

  const handleNext = useCallback(() => {
    if (totalImages > 1) {
      setCurrentImageIndex(prevIndex => 
        prevIndex === totalImages - 1 ? 0 : prevIndex + 1
      );
    }
  }, [totalImages]);

  const handlePrev = useCallback(() => {
    if (totalImages > 1) {
      setCurrentImageIndex(prevIndex => 
        prevIndex === 0 ? totalImages - 1 : prevIndex - 1
      );
    }
  }, [totalImages]);
  
  const handleModalNext = useCallback(() => {
    if (totalImages > 1) {
      setCurrentImageIndex(prevIndex => 
        prevIndex === totalImages - 1 ? 0 : prevIndex + 1
      );
    }
  }, [totalImages]);

  const handleModalPrev = useCallback(() => {
    if (totalImages > 1) {
      setCurrentImageIndex(prevIndex => 
        prevIndex === 0 ? totalImages - 1 : prevIndex - 1
      );
    }
  }, [totalImages]);
  

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || totalImages <= 1) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isModalOpen) return;

      if (totalImages <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, handlePrev, handleNext, totalImages]);
  
  // !!! КРИТИЧНОЕ ИЗМЕНЕНИЕ: Блокировка прокрутки основного тела при открытии модального окна
  useEffect(() => {
    if (isModalOpen) {
      // Блокируем прокрутку основного документа
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden'; // На всякий случай
    } else {
      // Восстанавливаем прокрутку
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isModalOpen]);


  // 1. 🌐 ФУНКЦИЯ ЗАГРУЗКИ ДЕТАЛЕЙ ОБЪЯВЛЕНИЯ (Без изменений)
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

  // Загрузка и ошибка (Без изменений)
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
      
      {/* -------------------- МОДАЛЬНОЕ ОКНО -------------------- */}
      {isModalOpen && (
        <FullscreenImageModal
          images={ad.images}
          currentIndex={currentImageIndex}
          onClose={() => setIsModalOpen(false)}
          onPrev={handleModalPrev}
          onNext={handleModalNext}
        />
      )}
      {/* -------------------------------------------------------- */}
      
      {/* Фон всей страницы: светло-серый */}
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        {/* Главный контейнер */}
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg shadow-gray-300/40 p-6 md:p-10">

          {/* Кнопка Назад */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition mb-8 font-semibold 
                       bg-gray-100 p-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-white"
          >
            <FiArrowLeft className="w-5 h-5" /> Назад
          </button>

          {/* Галерея изображений с прокруткой */}
          {((ad.images && ad.images.length > 0) || ad.imageUrl) && (
            // !!! ИСПРАВЛЕНИЕ: Удален px-2 для полной ширины на мобильных
            <div className="mb-8 sm:px-0"> 
              <div className="relative rounded-lg overflow-hidden shadow-md shadow-gray-400/30 bg-gray-100">
                
                {/* Основное изображение */}
                <div 
                  className="relative w-full h-[30rem] overflow-hidden group"
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
                    className="w-full h-full object-contain bg-white select-none cursor-pointer"
                    draggable={false}
                    onClick={() => setIsModalOpen(true)}
                  />
                  
                  {/* Кнопка полноэкранного режима */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Открыть полноэкранный просмотр"
                  >
                    <FiMaximize2 className="w-5 h-5" />
                  </button>

                  {/* Навигация по изображениям */}
                  {totalImages > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-all shadow-lg z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Предыдущее изображение"
                      >
                        <FiChevronLeft className="w-6 h-6" />
                      </button>
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg transition-all shadow-lg z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Следующее изображение"
                      >
                        <FiChevronRight className="w-6 h-6" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {currentImageIndex + 1} / {totalImages}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Миниатюры изображений */}
                {totalImages > 1 && (
                  <div className="flex gap-2 p-3 bg-white overflow-x-auto scrollbar-hide border-t border-gray-100">
                    {ad.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? "border-teal-500 shadow-md"
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
            </div>
          )}

          {/* Остальной контент страницы (Без изменений) */}
          <header className="mb-8 border-b pb-4 border-gray-100">
            <div 
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: ad.content || ad.title || "Объявление" }}
            />
            <p className="text-4xl font-extrabold text-teal-600 tracking-wide">
              {ad.price && ad.price > 0 
                ? `${ad.price} сом` 
                : "Договорная"}
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <FiMapPin className="w-6 h-6 text-teal-500" />
              <span className="text-lg font-medium">
                {[
                  ad.locationId?.name || null,
                  ad.location || null
                ].filter(Boolean).join(", ") || 'Местоположение не указано'}
              </span>
            </div>
            {ad.phone && (
              <div className="flex items-center gap-2">
                <FiPhone className="w-6 h-6 text-teal-500" />
                {ad.hidePhone ? (
                  <span className="text-lg font-medium text-gray-500">
                    Телефон скрыт
                  </span>
                ) : (
                  <a 
                    href={`tel:${ad.phone}`}
                    className="text-lg font-medium text-teal-600 hover:text-teal-700 hover:underline transition"
                  >
                    {ad.phone}
                  </a>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <FiCalendar className="w-6 h-6 text-gray-400" />
              <span className="text-sm">Опубликовано: {new Date(ad.createdAt).toLocaleDateString()}</span>
            </div>
            {ad.views !== undefined && (
              <div className="flex items-center gap-2">
                <FiEye className="w-6 h-6 text-gray-400" />
                <span className="text-sm">Просмотров: {ad.views || 0}</span>
              </div>
            )}
          </div>

          {/* Информация об авторе */}
          {ad.user && (
            <div 
              onClick={() => navigate(`/user/${ad.user._id}`)}
              className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition"
            >
              <div className="flex items-center gap-4">
                {ad.user.profileImageUrl ? (
                  <img 
                    src={ad.user.profileImageUrl} 
                    alt={ad.user.displayName || ad.user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-teal-500"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-teal-500">
                    <FaRegUserCircle className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FiUser className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {ad.user.displayName || ad.user.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Нажмите, чтобы посмотреть профиль и другие объявления
                  </p>
                </div>
              </div>
            </div>
          )}

          <section className="mb-10">
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-teal-500/30 pb-2">
              Подробное описание
            </h2> */}
            <div
              className="text-gray-700 leading-relaxed text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: ad.content }}
            />
          </section>

          {ad.tags && ad.tags.length > 0 && (
            <footer className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 flex-wrap">
                <FiTag className="w-6 h-6 text-teal-500" />
                {ad.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm bg-teal-50 text-teal-700 px-4 py-1.5 rounded-lg font-semibold transition hover:bg-teal-100"
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