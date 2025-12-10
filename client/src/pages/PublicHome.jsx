// src/pages/PublicHome.jsx
import React, { useEffect, useState, useContext } from "react"; 
import { useNavigate } from "react-router-dom";
import AdCard from "../components/AdCard"; 
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext"; 

// 💡 ИСПРАВЛЕНИЕ ОШИБКИ VITE/REACT-ICONS: 
// Вместо именованных импортов, импортируем все под псевдонимом (* as FeatherIcons).
// Это обходит проблему, когда Vite некорректно собирает именованные экспорты.
import * as FeatherIcons from "react-icons/fi"; 

// --- ФУНКЦИЯ: Соответствие иконок (Динамическая версия) ---
// Сопоставляет строку иконки из бэкенда с компонентом React, используя динамический импорт.
const getIconComponent = (iconName) => {
    // Формируем полное имя компонента, например, 'Car' -> 'FiCar'
    const IconComponentName = `Fi${iconName}`; 
    
    // Получаем компонент из объекта FeatherIcons по строковому имени
    const IconComponent = FeatherIcons[IconComponentName]; 
    
    // Если компонент найден, возвращаем его, иначе возвращаем FiZap по умолчанию.
    return IconComponent || FeatherIcons.FiZap; 
}

const PublicHome = () => {
  const [publicAds, setPublicAds] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 
  
  // Вспомогательная функция для очистки HTML
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // 1. 🌐 ФУНКЦИЯ ЗАГРУЗКИ ПУБЛИЧНЫХ ОБЪЯВЛЕНИЙ (зависит от фильтра)
  useEffect(() => {
    const fetchPublicAds = async () => {
      setLoading(true);
      try {
        // Добавляем параметр запроса, если выбрана категория
        const categoryQuery = selectedCategory ? `?category=${selectedCategory}` : '';
        const response = await fetch(`http://localhost:8080/api/ads/latest${categoryQuery}`); 
        
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
  }, [selectedCategory]); 


  // 2. 🗂️ ФУНКЦИЯ: Загрузка всех Главных Категорий 
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/categories");
            if (!response.ok) {
                throw new Error("Не удалось загрузить категории.");
            }
            const data = await response.json(); 
            setCategories(data);
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
            toast.error("Ошибка при загрузке структуры категорий.");
        }
    };
    fetchCategories();
  }, []); 

  // 3. 🖱️ ФУНКЦИЯ: Обработчик выбора категории
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(prev => (prev === categoryId ? null : categoryId));
  };
  
  // 4. 🗑️ ФУНКЦИЯ: Обработчик удаления объявления
  const handleDelete = async (adId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это объявление?")) return;
    
    try {
        const token = localStorage.getItem("token"); 
        if (!token) {
            toast.error("Не авторизован. Пожалуйста, войдите.");
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
            throw new Error(errorData.message || "Не удалось удалить объявление.");
        }

        toast.success("Объявление успешно удалено!");
        
        // Обновляем список
        setPublicAds(prevAds => prevAds.filter(ad => ad._id !== adId));

    } catch (error) {
        console.error("Ошибка удаления:", error);
        toast.error(error.message);
    }
  };


  // 5. ⏳ СОСТОЯНИЯ ЗАГРУЗКИ И ОТСУТСТВИЯ ОБЪЯВЛЕНИЙ
  if (loading) {
    // FiLoader берется из FeatherIcons.FiLoader
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50">
        <FeatherIcons.FiLoader className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-xl text-gray-700">Загрузка последних объявлений...</p>
      </div>
    );
  }
  
  if (publicAds.length === 0) {
    const isEmptyFiltered = selectedCategory !== null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-gray-50 p-8">
            <FeatherIcons.FiBookOpen className="w-16 h-16 text-teal-400 mb-4 shadow-md rounded-full p-2 bg-white" />
            <h1 className="text-3xl font-bold mb-4 text-gray-800">
                {isEmptyFiltered ? "В этой категории пока нет объявлений." : "Лента пока пуста"}
            </h1>
            <p className="text-xl mb-8 text-gray-600">
                {isEmptyFiltered 
                    ? "Попробуйте выбрать другую категорию или сбросить фильтр."
                    : "Опубликуйте первое объявление или войдите для просмотра своих."
                }
            </p>
            {!user && (
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold 
                                shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition transform hover:-translate-y-1"
                >
                    <FeatherIcons.FiLogIn className="w-5 h-5" />
                    Войти в систему
                </button>
            )}
            
            {isEmptyFiltered && (
                <button
                    onClick={() => handleCategorySelect(null)}
                    className="mt-4 text-teal-600 font-semibold hover:underline"
                >
                    Сбросить фильтр
                </button>
            )}
        </div>
    );
  }


  // 6. 🖼️ ОСНОВНОЕ ОТОБРАЖЕНИЕ ОБЪЯВЛЕНИЙ
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-8 bg-gray-50">
        <div className="max-w-screen-xl mx-auto py-8">
          


          {/* Блок Категорий (Навигация) */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FeatherIcons.FiGlobe className="text-teal-600" />
                Главные Категории
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((cat) => {
                const Icon = getIconComponent(cat.icon); 
                const isActive = selectedCategory === cat._id;
                
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat._id)}
                    className={`flex flex-col items-center p-4 rounded-xl shadow-lg 
                                transition-all duration-300 transform hover:scale-105 w-32 h-28 text-center
                                ${isActive 
                                  ? 'bg-teal-600 text-white shadow-teal-400/60' 
                                  : 'bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                                }`}
                  >
                    {/* Icon — это компонент, возвращаемый getIconComponent */}
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="font-semibold text-sm truncate w-full">{cat.name}</span>
                    <span className={`text-xs ${isActive ? 'text-teal-200' : 'text-gray-400'}`}>
                      {cat.subcategories.length} подкатегорий
                    </span>
                  </button>
                );
              })}
              {/* Кнопка "Все объявления" (Сброс фильтра) */}
              <button
                onClick={() => handleCategorySelect(null)}
                className={`flex flex-col items-center p-4 rounded-xl shadow-lg 
                            transition-all duration-300 transform hover:scale-105 w-32 h-28 text-center
                            ${selectedCategory === null 
                              ? 'bg-gray-600 text-white shadow-gray-400/60' 
                              : 'bg-white text-gray-700 hover:bg-gray-500 hover:text-white'
                            }`}
              >
                <FeatherIcons.FiBookOpen className="w-6 h-6 mb-2" />
                <span className="font-semibold text-sm truncate w-full">Все</span>
                <span className={`text-xs ${selectedCategory === null ? 'text-gray-200' : 'text-gray-400'}`}>
                   Сбросить фильтр
                </span>
              </button>
            </div>
          </section>
          
          {/* Заголовок текущей ленты */}
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
            {selectedCategory 
                ? `Объявления в категории: ${categories.find(c => c._id === selectedCategory)?.name}` 
                : "Все Последние Объявления"
            }
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {publicAds.map((ad) => {
              
              const currentUserID = user?._id; 
              const adOwnerID = ad.user?._id || ad.user; 
              
              const isOwner = currentUserID && (currentUserID === adOwnerID); 
              
              const cardClickHandler = () => navigate(`/ad-view/${ad._id}`);
              
              return (
                <AdCard
                  key={ad._id}
                  title={ad.title}
                  image={ad.images && ad.images[0] ? ad.images[0] : (ad.imageUrl || null)} 
                  descriptionSnippet={stripHtml(ad.content)?.slice(0, 100) || ""} 
                  datePosted={new Date(ad.createdAt).toLocaleDateString('ru-RU')}
                  tags={ad.tags || []}
                  price={ad.price}
                  location={ad.location}
                  categoryName={ad.category?.name || "Без категории"} 
                  
                  onCardClick={cardClickHandler} 
                  
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