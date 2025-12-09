import { useEffect, useState, useContext } from "react";
import AdCard from "../components/AdCard";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiGrid, FiArrowLeft, FiArrowRight, FiPlus, FiUser, FiSettings, FiCamera } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const ADS_PER_PAGE = 6;

// --- 💡 Макетный компонент для Настроек Профиля ---
const ProfileSettings = ({ user }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(user?.profileImageUrl || 'https://via.placeholder.com/150?text=Profile');

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Здесь должна быть логика сохранения данных и фото на сервер
        toast.success("Данные профиля обновлены (макет)");
        console.log("Сохранение:", { name, email, profileImage });
    };

    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl shadow-gray-300/50 my-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 border-b pb-4">
                <FiUser className="w-6 h-6 text-teal-600" /> 
                Редактирование Профиля
            </h2>
            <form onSubmit={handleSave}>
                
                {/* Загрузка Фото Профиля */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 mb-4">
                        <img 
                            src={previewImage} 
                            alt="Профиль" 
                            className="w-full h-full object-cover rounded-full ring-4 ring-teal-500/50 shadow-lg"
                        />
                        <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-2 bg-teal-500 text-white rounded-full cursor-pointer hover:bg-teal-600 transition shadow-lg shadow-teal-400/50">
                            <FiCamera className="w-5 h-5" />
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">Нажмите, чтобы изменить фото</p>
                </div>

                {/* Поля Данных */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 transition duration-200 bg-gray-50"
                            disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Email изменить нельзя.</p>
                    </div>
                </div>

                {/* Кнопка Сохранить */}
                <button
                    type="submit"
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold 
                               shadow-lg shadow-teal-400/50 hover:bg-teal-700 transition transform hover:-translate-y-0.5"
                >
                    <FiSettings className="w-5 h-5" /> Сохранить изменения
                </button>
            </form>
        </div>
    );
};
// -------------------------------------------------------------------


const Dashboard = () => {
  const [ads, setAds] = useState([]);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("Все");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('ads'); 
  
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();

  const fetchAds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("Токен аутентификации не найден");
      }

      // 💡 ИСПОЛЬЗУЕМ /api/ads/my, который мы исправили на бэкенде
      const response = await fetch("http://localhost:8080/api/ads/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Не удалось загрузить объявления");

      const data = await response.json();
      setAds(data);

      const allTags = new Set();
      data.forEach((ad) => {
        if (Array.isArray(ad.tags)) {
          ad.tags.forEach((tag) => allTags.add(tag));
        }
      });
      setTags(["Все", ...Array.from(allTags)]);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      if (err.message.includes("Authentication")) {
          navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ads') {
        fetchAds();
    }
  }, [activeTab]); // Загружаем объявления при смене на вкладку 'ads'


  const handleDelete = async (id, title) => {
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
      console.error(err.message);
      toast.error("Не удалось удалить объявление");
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };


  const filteredAds = ads.filter((ad) => {
    const contentMatch = `${ad.title} ${stripHtml(ad.content || "")} ${ad.location || ""}`
      .toLowerCase()
      .includes(query.toLowerCase());

    const tagMatch =
      tagFilter === "Все" || (ad.tags || []).includes(tagFilter);

    return contentMatch && tagMatch;
  });

  const totalPages = Math.ceil(filteredAds.length / ADS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADS_PER_PAGE;
  const paginatedAds = filteredAds.slice(
    startIndex,
    startIndex + ADS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleCardClick = (id) => {
      navigate(`/ad-view/${id}`);
  }
  
  if (loading && activeTab === 'ads') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="flex items-center text-xl text-teal-600">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Загрузка каталога объявлений...
        </div>
      </div>
    );
  }

  const TabButton = ({ tabName, icon: Icon, label }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all duration-300
                    ${isActive 
                      ? "bg-white text-teal-600 shadow-md shadow-gray-200/50 border-t-2 border-teal-500" // Активная вкладка
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200" // Неактивная вкладка
                    }`
                  }
      >
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }


  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 bg-gray-50">
        <div className="max-w-screen-xl mx-auto py-8">
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 hidden md:block">
            Панель Управления
          </h1>
          
          {/* Навигация по вкладкам (Tabs) */}
          <div className="flex border-b border-gray-200 mb-8">
            <TabButton tabName="ads" icon={FiGrid} label="Мои Объявления" />
            <TabButton tabName="profile" icon={FiUser} label="Настройки Профиля" />
          </div>

          {/* Контент вкладок */}
          {activeTab === 'ads' && (
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
      

                  {/* Блок фильтров (Поиск и Теги) */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    
                    {/* SearchBar */}
                    <div className="w-full md:w-3/5">
                      <SearchBar query={query} setQuery={setQuery} />
                    </div>

                    {/* Фильтр по тегам (Категориям) - Стиль Soft UI */}
                    <div className="w-full md:w-2/5 relative">
                      <label htmlFor="tag-filter" className="sr-only">Фильтр по категориям</label>
                      <select
                        id="tag-filter"
                        className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 
                                 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 
                                 text-base text-gray-800 transition duration-200"
                        value={tagFilter}
                        onChange={(e) => {
                          setTagFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        {tags.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag === "Все" ? "Все Категории" : tag}
                          </option>
                        ))}
                      </select>
                      {/* Кастомная иконка для Select */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-teal-600">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Отображение объявлений */}
                  {filteredAds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center text-gray-600 mt-12 p-10 
                                    bg-white border-2 border-dashed border-gray-300 rounded-2xl shadow-inner">
                      <p className="text-xl font-semibold mb-2">Объявления по вашему запросу не найдены.</p>
                      <p className="mb-4">Попробуйте использовать другие ключевые слова или сбросить фильтр категорий.</p>
                    </div>
                  ) : (
                    <>
                      {/* Список объявлений (Сетка) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                        {paginatedAds.map((ad) => (
                          <AdCard
                            key={ad._id}
                            title={ad.title}
                            image={ad.imageUrl}
                            descriptionSnippet={stripHtml(ad.content)?.slice(0, 100) || ""}
                            datePosted={new Date(ad.createdAt).toLocaleDateString('ru-RU')}
                            location={ad.location}
                            price={ad.price}
                            tags={ad.tags || []}
                            onCardClick={() => handleCardClick(ad._id)}
                            onEdit={() => navigate(`/edit-ad/${ad._id}`)}
                            onDelete={() => handleDelete(ad._id, ad.title)}
                          />
                        ))}
                      </div>

                      {/* Пагинация */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-16 space-x-2">
                          <button
                            className="flex items-center gap-1 px-5 py-2.5 bg-white text-gray-700 rounded-xl font-semibold 
                                       shadow-md hover:shadow-lg hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:shadow-none"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <FiArrowLeft className="w-4 h-4" />
                            Предыдущая
                          </button>

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
          )}

          {/* Вкладка: Настройки Профиля */}
          {activeTab === 'profile' && (
            <ProfileSettings user={user} />
          )}

        </div>
      </div>
    </>
  );
};

export default Dashboard;