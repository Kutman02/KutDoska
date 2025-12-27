// src/pages/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiLoader, FiArrowLeft, FiUser, FiPhone, FiMail, FiCalendar, FiGlobe } from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';
import AdCard from '../components/AdCard';
import Breadcrumb from '../components/Breadcrumb';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ads, setAds] = useState([]);
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
        toast.error(error.message || 'Не удалось загрузить профиль');
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
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <FiLoader className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-xl text-gray-700">Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Профиль не найден
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition font-medium p-3 rounded-xl bg-white shadow-md hover:shadow-lg"
        >
          <FiArrowLeft /> Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb items={[
            { label: 'Профиль', path: `/user/${id}` }
          ]} showHomeIcon={true} />

          {/* Кнопка Назад */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition mb-6 font-semibold 
                       bg-gray-100 p-2.5 rounded-lg shadow-sm hover:shadow-md hover:bg-white"
          >
            <FiArrowLeft className="w-5 h-5" /> Назад
          </button>

          {/* Карточка профиля */}
          <div className="bg-white rounded-xl shadow-lg shadow-gray-300/40 p-6 md:p-10 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Аватар */}
              {profile.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-teal-500 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-teal-500 shadow-lg">
                  <FaRegUserCircle className="w-24 h-24 text-gray-400" />
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
                    <span>На сайте с {new Date(profile.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>

                {profile.about && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{profile.about}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Объявления пользователя */}
          <div className="bg-white rounded-xl shadow-lg shadow-gray-300/40 p-6 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-3">
              Объявления пользователя ({ads.length})
            </h2>

            {ads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FiUser className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600">У пользователя пока нет объявлений</h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
                {ads.map((ad) => {
                  const fullLocation = [
                    ad.locationId?.name || null,
                    ad.location || null
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <AdCard
                      key={ad._id}
                      adId={ad._id}
                      title={ad.content || ad.title || ""}
                      image={ad.images?.[0] || ad.imageUrl}
                      descriptionSnippet={stripHtml(ad.content)?.slice(0, 100)}
                      datePosted={new Date(ad.createdAt).toLocaleDateString('ru-RU')}
                      tags={ad.tags || []}
                      price={ad.price}
                      location={fullLocation}
                      categoryName={ad.category?.name}
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

