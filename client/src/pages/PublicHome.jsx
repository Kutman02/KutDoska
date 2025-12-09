// src/pages/PublicHome.jsx
import React, { useEffect, useState, useContext } from "react"; 
import { useNavigate } from "react-router-dom";
import AdCard from "../components/AdCard"; 
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext"; 
import { FiGlobe, FiLogIn, FiLoader, FiBookOpen, FiZap } from "react-icons/fi"; // FiZap для акцента

const PublicHome = () => {
  const [publicAds, setPublicAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 
  
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // 1. 🌐 ФУНКЦИЯ ЗАГРУЗКИ ПУБЛИЧНЫХ ОБЪЯВЛЕНИЙ
  useEffect(() => {
    const fetchPublicAds = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/ads/latest"); 
        
        if (!response.ok) {
          const errorText = await response.text(); 
          throw new Error(`Не удалось загрузить ленту объявлений. Статус: ${response.status}. Ответ сервера: ${errorText.slice(0, 50)}...`);
        }
        
        const data = await response.json();
        setPublicAds(data);
      } catch (error) {
        console.error("Ошибка при получении публичных объявлений:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicAds();
  }, []); 

  // 🗑️ Обработчик удаления объявления (без изменений)
  const handleDelete = async (adId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это объявление?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Необходимо войти, чтобы удалить объявление.");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/ads/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось удалить объявление. Проверьте права.");
      }

      toast.success("Объявление успешно удалено!");
      setPublicAds(prevAds => prevAds.filter(ad => ad._id !== adId)); 

    } catch (error) {
      console.error("Ошибка при удалении:", error);
      toast.error(error.message);
    }
  };


  // 2. ⏳ СОСТОЯНИЯ ЗАГРУЗКИ И ОТСУТСТВИЯ ОБЪЯВЛЕНИЙ
  if (loading) {
    return (
      // Контейнер загрузки Soft UI
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-xl text-gray-700">
            Загрузка последних объявлений...
        </p>
      </div>
    );
  }
  
  if (publicAds.length === 0) {
    return (
      // Пустое состояние Soft UI
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-gray-50 p-8">
        <FiBookOpen className="w-16 h-16 text-teal-400 mb-4 shadow-md rounded-full p-2 bg-white" />
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Лента пока пуста
        </h1>
        <p className="text-xl mb-8 text-gray-600">
            Опубликуйте первое объявление или войдите для просмотра своих.
        </p>
        <button
          onClick={() => navigate("/login")}
          // Акцентная кнопка Soft UI
          className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold 
                     shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition transform hover:-translate-y-1"
        >
          <FiLogIn className="w-5 h-5" />
          Войти в систему
        </button>
      </div>
    );
  }

  // 3. 🖼️ ОСНОВНОЕ ОТОБРАЖЕНИЕ ОБЪЯВЛЕНИЙ
  return (
    <>
      <Toaster position="top-right" />
      {/* Мягкий фон для ленты */}
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        <div className="max-w-screen-xl mx-auto py-8">
          
          {/* 💡 Заголовок (Soft UI) */}
          <header className="text-center mb-12">
            <FiZap className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-wide">
                Общедоступная Лента Объявлений
            </h1>
            <p className="text-lg text-gray-600">
                Последние публичные предложения.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {publicAds.map((ad) => {
              
              const currentUserID = user?._id; 
              const adOwnerID = ad.user;
              
              const isOwner = currentUserID && (currentUserID === adOwnerID); 
              
              // 💡 Функция для перехода на страницу просмотра
              const cardClickHandler = () => navigate(`/ad-view/${ad._id}`);
              
              return (
                <AdCard
                  key={ad._id}
                  title={ad.title}
                  image={ad.imageUrl} 
                  // Убедимся, что мы передаем `descriptionSnippet` (как в Dashboard)
                  descriptionSnippet={stripHtml(ad.content)?.slice(0, 100) || ""} 
                  datePosted={new Date(ad.createdAt).toLocaleDateString('ru-RU')}
                  tags={ad.tags || []}
                  price={ad.price}
                  location={ad.location}
                  
                  onCardClick={cardClickHandler} 
                  
                  // Передаем кнопки действий ТОЛЬКО владельцу
                  onEdit={isOwner ? () => navigate(`/edit-ad/${ad._id}`) : null}
                  onDelete={isOwner ? () => handleDelete(ad._id) : null}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicHome;