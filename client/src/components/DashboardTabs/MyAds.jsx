// src/components/DashboardTabs/MyAds.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdCard from "../AdCard";
import SearchBar from "../SearchBar";
import { FiGrid, FiArrowLeft, FiArrowRight, FiPlus } from "react-icons/fi";

const ADS_PER_PAGE = 6;

// Вспомогательная функция для очистки HTML
const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

const MyAds = ({ user }) => {
  const [ads, setAds] = useState([]);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("Все");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("Токен аутентификации не найден");
      }

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
          // Если токен невалиден, перенаправляем на логин
          navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);


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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center text-xl text-teal-600">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Загрузка объявлений...
        </div>
      </div>
    );
  }

  return (
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

            {/* Фильтр по тегам (Категориям) */}
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
                  image={ad.images?.[0] || ad.imageUrl || null}
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
  );
};

export default MyAds;