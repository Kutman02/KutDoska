import { useEffect, useState } from "react";
import AdCard from "../components/AdCard"; // ИЗМЕНЕНО: NoteCard -> AdCard
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiGrid, FiArrowLeft, FiArrowRight } from "react-icons/fi"; // Новые иконки

const ADS_PER_PAGE = 6; // ИЗМЕНЕНО: NOTES_PER_PAGE -> ADS_PER_PAGE

const Dashboard = () => {
  const [ads, setAds] = useState([]); // ИЗМЕНЕНО: notes -> ads
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("Все");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const fetchAds = async () => { // ИЗМЕНЕНО: fetchNotes -> fetchAds
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Если нет токена, перенаправляем на логин
        navigate("/login"); 
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "http://localhost:8080/api/ads", // ИЗМЕНЕНО: /api/notes -> /api/ads
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch advertisements"); // ИЗМЕНЕНО: notes -> advertisements

      const data = await response.json();
      setAds(data); // ИЗМЕНЕНО: setNotes -> setAds

      const allTags = new Set();
      data.forEach((ad) => { // ИЗМЕНЕНО: note -> ad
        if (Array.isArray(ad.tags)) {
          ad.tags.forEach((tag) => allTags.add(tag));
        }
      });
      // Используем "Все" вместо "all" для соответствия UI
      setTags(["Все", ...Array.from(allTags)]);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(); // ИЗМЕНЕНО: fetchNotes -> fetchAds
  }, []);

  const handleDelete = async (id, title) => {
    const confirm = window.confirm(
      `Вы уверены, что хотите удалить объявление: "${title}"?`
    );
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/ads/${id}`, // ИЗМЕНЕНО: /api/notes -> /api/ads
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete advertisement");

      setAds((prev) => prev.filter((ad) => ad._id !== id)); // ИЗМЕНЕНО: setNotes -> setAds, note -> ad
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

  const filteredAds = ads.filter((ad) => { // ИЗМЕНЕНО: notes -> ads, note -> ad
    // Ищем соответствие по заголовку, контенту или, возможно, цене/локации (если добавите в поиск)
    const contentMatch = `${ad.title} ${stripHtml(ad.content || "")} ${ad.location || ""}` // ДОБАВЛЕНО: ad.location
      .toLowerCase()
      .includes(query.toLowerCase());

    // Фильтрация по тегам
    const tagMatch =
      tagFilter === "Все" || (ad.tags || []).includes(tagFilter); // ИЗМЕНЕНО: note -> ad

    return contentMatch && tagMatch;
  });

  const totalPages = Math.ceil(filteredAds.length / ADS_PER_PAGE); // ИЗМЕНЕНО: NOTES_PER_PAGE -> ADS_PER_PAGE
  const startIndex = (currentPage - 1) * ADS_PER_PAGE; // ИЗМЕНЕНО: NOTES_PER_PAGE -> ADS_PER_PAGE
  const paginatedAds = filteredAds.slice( // ИЗМЕНЕНО: paginatedNotes -> paginatedAds
    startIndex,
    startIndex + ADS_PER_PAGE // ИЗМЕНЕНО: NOTES_PER_PAGE -> ADS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // 💡 Функция для обработки клика по карточке
  const handleCardClick = (id) => {
      // Навигация на страницу просмотра объявления
      // Используйте URL-адрес для просмотра (например, /ads/123)
      navigate(`/ads/${id}`); // ИЗМЕНЕНО: /notes/ -> /ads/
  }

  // --- Сообщения о состоянии (Loading/Error) ---
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center text-lg text-teal-600 dark:text-teal-400"> {/* ИЗМЕНЕНО: blue -> teal */}
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Загрузка каталога объявлений...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-red-600 bg-gray-50 dark:bg-gray-900">
        Ошибка: {error}
      </div>
    );
  }
  // ---------------------------------------------

  return (
    <>
      <Toaster position="top-right" />

      {ads.length === 0 ? ( // ИЗМЕНЕНО: notes.length -> ads.length
        // 💡 Стиль для пустого состояния
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-gray-50 dark:bg-gray-900 p-8">
          <FiGrid className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Каталог объявлений пуст
          </p>
          <p className="mb-8 text-gray-500 dark:text-gray-400">
            Опубликуйте первое объявление, чтобы начать.
          </p>
          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-teal-700 transition" // ИЗМЕНЕНО: blue -> teal
          >
            + Создать объявление
          </button>
        </div>
      ) : (
        <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-screen-xl mx-auto py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-0">
                Мои Объявления
              </h1>
              
              {/* Кнопка "Создать" в верхней части */}
              <button
                onClick={() => navigate("/create")}
                className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-teal-700 transition" // ИЗМЕНЕНО: blue -> teal
              >
                + Разместить
              </button>
            </div>

            {/* Блок фильтров (Поиск и Теги) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              
              {/* SearchBar */}
              <div className="w-full md:w-3/5">
                <SearchBar query={query} setQuery={setQuery} />
              </div>

              {/* Фильтр по тегам (Категориям) */}
              <div className="w-full md:w-2/5 relative">
                <label htmlFor="tag-filter" className="sr-only">Фильтр по категориям</label>
                <select
                  id="tag-filter"
                  className="w-full appearance-none px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-base shadow-sm" // ИЗМЕНЕНО: focus:ring-blue-500 -> focus:ring-teal-500
                  value={tagFilter}
                  onChange={(e) => {
                    setTagFilter(e.target.value);
                    setCurrentPage(1); // Сброс пагинации при смене фильтра
                  }}
                >
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag === "Все" ? "Все Категории" : tag}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Отображение заметок */}
            {filteredAds.length === 0 ? ( // ИЗМЕНЕНО: filteredNotes -> filteredAds
              <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 mt-12 p-8 border border-dashed border-gray-400 dark:border-gray-600 rounded-xl">
                <p className="text-xl mb-2">Объявления по вашему запросу не найдены.</p>
                <p className="mb-4">Попробуйте использовать другие ключевые слова или сбросить фильтр категорий.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                  {paginatedAds.map((ad) => ( // ИЗМЕНЕНО: paginatedNotes -> paginatedAds, note -> ad
                    <AdCard // ИЗМЕНЕНО: NoteCard -> AdCard
                      key={ad._id}
                      title={ad.title}
                      image={ad.imageUrl}
                      descriptionSnippet={stripHtml(ad.content)?.slice(0, 100) || ""} // ИЗМЕНЕНО: snippet -> descriptionSnippet
                      datePosted={new Date(ad.createdAt).toLocaleDateString()} // ИЗМЕНЕНО: date -> datePosted
                      location={ad.location} // ДОБАВЛЕНО: location
                      price={ad.price} // ДОБАВЛЕНО: price
                      tags={ad.tags || []}
                      // 💡 Добавлена функция клика по карточке
                      onCardClick={() => handleCardClick(ad._id)} 
                      // Кнопки редактирования и удаления все равно нужны для действий
                      onEdit={() => navigate(`/edit-ad/${ad._id}`)} // ИЗМЕНЕНО: /edit-notes -> /edit-ad
                      onDelete={() => handleDelete(ad._id, ad.title)}
                    />
                  ))}
                </div>

                {/* Пагинация - Стиль "Доски объявлений" */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-16 space-x-2">
                    <button
                      className="flex items-center gap-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Предыдущая
                    </button>

                    {/* Отображение номеров страниц */}
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 rounded-full font-bold transition duration-200 ${
                          currentPage === i + 1
                            ? "bg-teal-600 text-white shadow-md" // ИЗМЕНЕНО: blue -> teal
                            : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-teal-200 dark:hover:bg-teal-900" // ИЗМЕНЕНО: blue -> teal
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className="flex items-center gap-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
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
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;