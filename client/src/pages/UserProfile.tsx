// src/pages/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiLoader, FiArrowLeft, FiUser, FiPhone, FiCalendar, FiGlobe } from 'react-icons/fi';
import AdCard from '../components/AdCard';
import Breadcrumb from '../components/Breadcrumb';
import type { UserProfileData } from '../types/page.types';
import type { Ad } from '../types/ad.types';
import type { BreadcrumbItem } from '../types/component.types';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Загружаем профиль пользователя
        const profileRes = await fetch(`http://localhost:8080/api/auth/users/${id}/profile`);
        if (!profileRes.ok) {
          throw new Error('Профиль пользователя не найден');
        }
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Загружаем объявления пользователя
        const adsRes = await fetch(`http://localhost:8080/api/auth/users/${id}/ads`);
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAds(adsData);
        }
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить профиль';
        toast.error(errorMessage);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  // Вспомогательная функция для stripHtml
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

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <FiLoader className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-xl text-gray-700">Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Профиль не найден
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors font-medium p-3 rounded-md"
        >
          <FiArrowLeft /> Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen w-full p-4 sm:p-8">
        <div className="w-full">
          <Breadcrumb items={id ? [
            { label: 'Профиль', path: `/user/${id}` }
          ] as BreadcrumbItem[] : []} showHomeIcon={true} />

          {/* Кнопка Назад */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors mb-6 font-semibold 
                       p-2.5 rounded-md"
          >
            <FiArrowLeft className="w-5 h-5" /> Назад
          </button>

          {/* Карточка профиля - без отдельного фона */}
          <div className="p-6 md:p-10 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Аватар */}
              {profile.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                  <FiUser className="w-16 h-16 text-white" />
                </div>
              )}

              {/* Информация о пользователе */}
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="w-8 h-8 text-teal-600" />
                  {profile.name}
                </h1>

                <div className="space-y-3">
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiPhone className="w-5 h-5 text-teal-600" />
                      <a 
                        href={`tel:${profile.phone}`}
                        className="hover:text-teal-600 hover:underline transition"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiGlobe className="w-5 h-5 text-teal-600" />
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-600 hover:underline transition"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FiCalendar className="w-4 h-4" />
                    <span>На сайте с {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('ru-RU') : 'неизвестно'}</span>
                  </div>
                </div>

                {profile.about && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-700 leading-relaxed">{profile.about}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Объявления пользователя - без отдельного фона */}
          <div className="p-6 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-3">
              Объявления пользователя ({ads.length})
            </h2>

            {ads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FiUser className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600">У пользователя пока нет объявлений</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                {ads.map((ad: Ad) => {
                  const locationIdName = typeof ad.locationId === 'object' && ad.locationId !== null ? ad.locationId.name : null;
                  const fullLocation = [
                    locationIdName || null,
                    ad.location || null
                  ]
                    .filter(Boolean)
                    .join(", ");
                  const categoryName = typeof ad.category === 'object' && ad.category !== null ? ad.category.name : undefined;

                  return (
                    <AdCard
                      key={ad._id}
                      adId={ad._id}
                      title={ad.content || ad.title || ""}
                      image={ad.images?.[0] || ad.imageUrl}
                      descriptionSnippet={stripHtml(ad.content)?.slice(0, 100)}
                      datePosted={ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('ru-RU') : undefined}
                      tags={ad.tags || []}
                      price={ad.price}
                      location={fullLocation}
                      categoryName={categoryName}
                      onCardClick={() => navigate(`/ad-view/${ad._id}`)}
                      onEdit={null}
                      onDelete={null}
                      isFavorite={false}
                      onToggleFavorite={() => {}}
                      views={ad.views}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;

