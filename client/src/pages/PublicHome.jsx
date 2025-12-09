// src/pages/PublicHome.jsx
import React, { useEffect, useState, useContext } from "react"; 
import { useNavigate } from "react-router-dom";
import NoteCard from "../components/NoteCard"; 
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext"; 
import { FiGlobe, FiLogIn, FiLoader, FiBookOpen } from "react-icons/fi"; // Новые иконки

const PublicHome = () => {
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 
  
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // 1. 🌐 ФУНКЦИЯ ЗАГРУЗКИ ПУБЛИЧНЫХ ЗАМЕТОК
  useEffect(() => {
    const fetchPublicNotes = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/notes/latest"); 
        
       // src/pages/PublicHome.jsx (Исправленный код)
// ...
        if (!response.ok) {
          const errorText = await response.text(); 
          // 💡 Используем errorText для более детального сообщения
          throw new Error(`Не удалось загрузить ленту. Статус: ${response.status}. Ответ сервера: ${errorText.slice(0, 50)}...`);
        }
// ...
        
        const data = await response.json();
        setPublicNotes(data);
      } catch (error) {
        console.error("Ошибка при получении публичных заметок:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicNotes();
  }, []); 

  // 🗑️ Обработчик удаления заметки
  const handleDelete = async (noteId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту заметку?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Необходимо войти, чтобы удалить заметку.");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось удалить заметку. Проверьте права.");
      }

      toast.success("Объявление успешно удалено!");
      setPublicNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));

    } catch (error) {
      console.error("Ошибка при удалении:", error);
      toast.error(error.message);
    }
  };


  // 2. ⏳ СОСТОЯНИЯ ЗАГРУЗКИ И ОТСУТСТВИЯ ЗАМЕТОК
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-white dark:bg-gray-950">
        <FiLoader className="w-8 h-8 text-pink-500 animate-spin mb-4" />
        <p className="text-xl text-gray-700 dark:text-gray-300">
            Загрузка последних идей...
        </p>
      </div>
    );
  }
  
  if (publicNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-gradient-to-br from-pink-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <FiBookOpen className="w-12 h-12 text-pink-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Лента пока пуста
        </h1>
        <p className="text-xl mb-6 text-gray-600 dark:text-gray-400">
            Опубликуйте первую публичную заметку или войдите для просмотра своих.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:from-pink-600 hover:to-orange-600 transition transform hover:-translate-y-0.5"
        >
          <FiLogIn className="w-5 h-5" />
          Войти
        </button>
      </div>
    );
  }

  // 3. 🖼️ ОСНОВНОЕ ОТОБРАЖЕНИЕ ЗАМЕТОК
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-8 bg-gradient-to-br from-pink-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-screen-xl mx-auto py-8">
          
          {/* 💡 Заголовок в стиле журнала */}
          <header className="text-center mb-12">
            <FiGlobe className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-wide">
                Общедоступная Лента
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Последние идеи и объявления со всего мира.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {publicNotes.map((note) => {
              
              const currentUserID = user?._id; 
              const noteOwnerID = note.user; 
              
              const isOwner = currentUserID && (currentUserID === noteOwnerID); 
              
              // 💡 Функция для перехода на страницу просмотра
              const cardClickHandler = () => navigate(`/note-view/${note._id}`);
              
              return (
                <NoteCard
                  key={note._id}
                  title={note.title}
                  image={note.imageUrl} 
                  snippet={stripHtml(note.content)?.slice(0, 100) || ""} 
                  date={new Date(note.createdAt).toLocaleDateString()}
                  tags={note.tags || []}
                  
                  onCardClick={cardClickHandler} 
                  
                  // Передаем кнопки действий ТОЛЬКО владельцу
                  onEdit={isOwner ? () => navigate(`/edit-notes/${note._id}`) : null} 
                  onDelete={isOwner ? () => handleDelete(note._id) : null} 
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