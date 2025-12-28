// src/pages/AdView.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FiLoader, FiTag, FiMapPin, FiArrowLeft, FiCalendar, 
  FiPhone, FiChevronLeft, FiChevronRight, FiMaximize2, FiX, FiUser, FiEye, FiGrid
} from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';
import type { Ad } from '../types/ad.types';
import type { User } from '../types/user.types';

// Вспомогательная функция для очистки HTML
const stripHtml = (html: unknown): string => {
  if (!html) return "";
  if (typeof html !== 'string') return String(html);
  // Удаляем все HTML теги с помощью регулярного выражения
  const text = html.replace(/<[^>]*>/g, '');
  // Декодируем HTML entities
  const tmp = document.createElement("div");
  tmp.innerHTML = text;
  return tmp.textContent || tmp.innerText || text;
};

// ====================================================================
// --- 1. КОМПОНЕНТ МОДАЛЬНОГО ОКНА ДЛЯ ПОЛНОЭКРАННОГО ПРОСМОТРА ---
// Масштабирование: Убран max-h-full, чтобы изображение могло быть больше экрана.
// ====================================================================

interface FullscreenImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const FullscreenImageModal: React.FC<FullscreenImageModalProps> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  // Логика свайпа, клавиатуры и остальное остаются прежними...
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
  
  const handleKeyModal = useCallback((e: KeyboardEvent) => {
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
          className="object-contain"
          draggable={false}
        />
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-md text-sm font-semibold">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>

      {totalImages > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-md transition-colors z-50 hidden sm:block"
            aria-label="Предыдущее изображение"
          >
            <FiChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-md transition-colors z-50 hidden sm:block"
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

const AdView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
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
  

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
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
    const handleKeyPress = (e: KeyboardEvent) => {
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


  // 1. 🌐 ФУНКЦИЯ ЗАГРУЗКИ ДЕТАЛЕЙ ОБЪЯВЛЕНИЯ
  // Используем useRef для предотвращения двойного запроса (защита от React StrictMode)
  const hasFetched = useRef(false);
  
  useEffect(() => {
    // Сбрасываем флаг при изменении id
    hasFetched.current = false;
    
    const fetchAdDetails = async () => {
      // Защита от двойного запроса
      if (hasFetched.current) return;
      hasFetched.current = true;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/ads/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (!response.ok) {
          throw new Error('Объявление не найдено или произошла ошибка сервера.');
        }

        const data = await response.json();
        setAd(data);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error("Ошибка при получении объявления:", error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        toast.error(errorMessage);
        setAd(null);
        hasFetched.current = false; // Разрешаем повторную попытку при ошибке
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdDetails();
    }
    
    // Cleanup функция
    return () => {
      hasFetched.current = false;
    };
  }, [id]);

  // Загрузка и ошибка (Без изменений)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <FiLoader className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-xl text-gray-700">
          Загрузка объявления...
        </p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Объявление не найдено
        </h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors font-medium p-3 rounded-md"
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
      
      {/* Полноэкранная страница без отдельного фона */}
      <div className="min-h-screen w-full p-2 sm:p-4 md:p-8">
        {/* Главный контейнер на всю ширину */}
        <div className="w-full p-2 sm:p-4 md:p-6 lg:p-10">

          {/* Кнопка Назад */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors mb-4 sm:mb-6 md:mb-8 font-semibold 
                       bg-gray-100 p-2 rounded-md hover:bg-gray-200"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Назад
          </button>

          {/* Двухколоночный layout для ПК */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            
            {/* ЛЕВАЯ КОЛОНКА: Фото и основной контент */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
              
              {/* Галерея изображений */}
              {((ad.images && ad.images.length > 0) || ad.imageUrl) && (
                <div className="mb-4 sm:mb-6 md:mb-8"> 
                  <div className="relative overflow-hidden bg-gray-100">
                    
                    {/* Основное изображение */}
                    <div 
                      className="relative w-full h-120 overflow-hidden group"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                    >
                      <img
                        src={
                          ad.images && ad.images.length > 0
                            ? ad.images[currentImageIndex]
                            : ad.imageUrl || ''
                        }
                        alt={ad.title || 'Объявление'}
                        className="w-full h-full object-contain bg-white cursor-pointer"
                        draggable={false}
                        onClick={() => setIsModalOpen(true)}
                      />
                      
                      {/* Кнопка полноэкранного режима */}
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Открыть полноэкранный просмотр"
                      >
                        <FiMaximize2 className="w-5 h-5" />
                      </button>

                      {/* Навигация по изображениям */}
                      {totalImages > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-md transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Предыдущее изображение"
                          >
                            <FiChevronLeft className="w-6 h-6" />
                          </button>
                          
                          <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-md transition-colors z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Следующее изображение"
                          >
                            <FiChevronRight className="w-6 h-6" />
                          </button>
                          
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-md text-sm font-semibold">
                            {currentImageIndex + 1} / {totalImages}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Миниатюры изображений */}
                    {totalImages > 1 && (
                      <div className="flex gap-2 p-3 bg-white overflow-x-auto scrollbar-hide border-t border-gray-100">
                        {ad.images.map((img: string, index: number) => (
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

              {/* Заголовок и категория */}
              <div className="mb-4 sm:mb-6">
                {/* Категория как бейдж */}
                {(ad.category || ad.subcategory) && (
                  <div className="mb-3 sm:mb-4">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs sm:text-sm font-semibold rounded-md">
                      <FiGrid className="w-3 h-3 sm:w-4 sm:h-4" />
                      {(typeof ad.subcategory === 'object' && ad.subcategory !== null ? ad.subcategory.name : null) || 
                       (typeof ad.category === 'object' && ad.category !== null ? ad.category.name : null) || ""}
                    </span>
                  </div>
                )}
                
                {/* Заголовок объявления - показываем только если есть title и он отличается от начала контента */}
                {ad.title && ad.title.trim() && (() => {
                  // Извлекаем текст из контента (без HTML тегов) для сравнения
                  const contentText = ad.content ? ad.content.replace(/<[^>]+>/g, '').trim() : '';
                  const titleText = stripHtml(ad.title).trim();
                  // Показываем заголовок только если он отличается от начала контента
                  const shouldShowTitle = !contentText.startsWith(titleText) && titleText !== contentText.substring(0, titleText.length);
                  return shouldShowTitle ? (
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 leading-tight mb-3 sm:mb-4 md:mb-6">
                      {titleText}
                    </h1>
                  ) : null;
                })()}
              </div>

              {ad.content && (
            <section className="mb-6 sm:mb-8 md:mb-10">
              <h6 className="text-xs sm:text-sm md:text-base font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 sm:mb-4 md:mb-5">
                Полное описание
              </h6>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-5 md:mb-6"
                
                dangerouslySetInnerHTML={{
                  __html: ad.content || '',
                }}
              />
            </section>
              )}

              {/* Теги */}
              {ad.tags && ad.tags.length > 0 && (
                <footer className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <FiTag className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500 dark:text-teal-400" />
                    {ad.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs sm:text-sm bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-md font-semibold transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </footer>
              )}
            </div>

            {/* ПРАВАЯ КОЛОНКА: Цена, пользователь, контакты */}
            <div className="lg:col-span-1 space-y-3 sm:space-y-4 md:space-y-6">
              
              {/* Цена */}
              <div className="p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-wide mb-1 sm:mb-2">
                  {ad.price && ad.price > 0 
                    ? new Intl.NumberFormat('ru-RU', { 
                        style: 'decimal',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(ad.price) + ' KGS'
                    : "Договорная"}
                </p>
              </div>

              {/* Информация об авторе */}
              {ad.user && (() => {
                const user = typeof ad.user === 'object' && ad.user !== null ? ad.user : null;
                if (!user) return null;
                return (
                  <div 
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col items-center text-center">
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt={(user as User & { displayName?: string }).displayName || user.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mb-2 sm:mb-3 md:mb-4"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                          <FaRegUserCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-200">
                          {(user as User & { displayName?: string }).displayName || user.name}
                        </h3>
                      </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                      Нажмите, чтобы посмотреть профиль
                    </p>
                  </div>
                </div>
                );
              })()}

              {/* Контакты и информация */}
              <div className="p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 space-y-3 sm:space-y-4">
                {/* Телефон */}
                {ad.phone && (
                  <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700">
                    <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500 dark:text-teal-400 shrink-0" />
                    <div className="flex-1">
                      {ad.hidePhone ? (
                        <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-slate-400">
                          Телефон скрыт
                        </span>
                      ) : (
                        <a 
                          href={`tel:${ad.phone}`}
                          className="text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition"
                        >
                          {ad.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Город */}
                <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700">
                  <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500 dark:text-teal-400 shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-slate-300">
                    {[
                      (typeof ad.locationId === 'object' && ad.locationId !== null ? ad.locationId.name : null) || null,
                      ad.location || null
                    ].filter(Boolean).join(", ") || 'Не указано'}
                  </span>
                </div>

                {/* Дата публикации */}
                <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700">
                  <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-slate-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                    {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : 'Не указано'}
                  </span>
                </div>

                {/* Просмотры */}
                {ad.views !== undefined && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FiEye className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-slate-500 shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                      {ad.views || 0} просмотров
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdView;