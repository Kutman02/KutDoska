// src/components/CreateAd.jsx (Переименован из CreateNote.jsx)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FiImage, FiTag, FiLock, FiUnlock, FiSend, FiDollarSign, FiMapPin } from "react-icons/fi"; // Новые иконки

// Классы для стилизации кнопок Tiptap
const TiptapButtonClass = (isActive) => 
  `p-2 rounded-lg text-sm font-medium transition duration-200 
   ${isActive 
     ? "bg-teal-600 text-white shadow-md hover:bg-teal-700" // ИЗМЕНЕНО: purple -> teal
     : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
   }`;

const CreateAd = () => { // ИЗМЕНЕНО: CreateNote -> CreateAd
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(""); 
  const [price, setPrice] = useState(""); // ДОБАВЛЕНО: Поле для цены
  const [location, setLocation] = useState(""); // ДОБАВЛЕНО: Поле для локации
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true); // Объявления по умолчанию публичные

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Введите подробное описание товара или услуги. Укажите состояние, характеристики и условия сделки...</p>", // ИЗМЕНЕНО: Текст заглушка
    editorProps: {
      attributes: {
        // Добавляем класс для стилизации содержимого редактора
        class: "prose dark:prose-invert max-w-none focus:outline-none p-4", 
      },
    },
  });

  const handleImageUpload = async (selectedFile) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Имитация загрузки
      setLoading(true); 
      // Адаптируйте URL для загрузки изображений объявлений, если нужно
      const res = await fetch("http://localhost:8080/api/upload/ad-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Не удалось загрузить изображение");

      const data = await res.json();
      setImageUrl(data.imageUrl); 
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editor?.getText();

    if (!title.trim() || !content.trim() || !price.trim()) { // ДОБАВЛЕНО: Проверка цены
      alert("Пожалуйста, заполните Заголовок, Цену и Описание.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Пользователь не аутентифицирован");
        return;
      }

      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // ИЗМЕНЕНО: URL на создание объявления
      const response = await fetch(
        "http://localhost:8080/api/ads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content,
            price: parseFloat(price), // Отправляем цену как число
            location, // ДОБАВЛЕНО: локация
            imageUrl,
            tags: tagArray,
            isPublic, 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось создать объявление."); // ИЗМЕНЕНО: Заметка -> Объявление
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Ошибка при создании объявления:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 💡 Измененный фон: purple-50 -> teal-50
    <div className="min-h-screen p-8 bg-teal-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        {/* ИЗМЕНЕНО: Заголовок и цвет */}
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b-2 border-teal-400 pb-2">
          Разместить Новое Объявление
        </h2>

        {/* Форма обернута в карточку */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          
          {/* 1. Заголовок */}
          <div className="relative">
            <input
              type="text"
              placeholder="Название товара или услуги (обязательно)" // ИЗМЕНЕНО: Заголовок заметки -> Название товара
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              // ИЗМЕНЕНО: Цвет фокуса
              className="w-full px-5 py-3 text-lg border-b-2 border-gray-300 dark:border-gray-700 focus:border-teal-500 bg-transparent dark:text-white focus:outline-none transition duration-200 font-semibold"
            />
          </div>

          {/* 2. Цена и Локация (В одном ряду) */}
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* Поле Цены */}
            <div className="flex items-center gap-3 border p-3 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-700 w-full sm:w-1/2">
                <FiDollarSign className="w-5 h-5 text-teal-500 dark:text-teal-400" /> {/* ИЗМЕНЕНО: Цвет иконки */}
                <input
                type="number"
                placeholder="Цена (в сомах)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent dark:text-gray-200 focus:outline-none appearance-none"
                required // Обязательное поле для объявления
                />
            </div>

            {/* Поле Локации */}
            <div className="flex items-center gap-3 border p-3 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-700 w-full sm:w-1/2">
                <FiMapPin className="w-5 h-5 text-teal-500 dark:text-teal-400" /> {/* ИЗМЕНЕНО: Цвет иконки */}
                <input
                type="text"
                placeholder="Город или адрес"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent dark:text-gray-200 focus:outline-none"
                />
            </div>

          </div>

          {/* 3. Поле Тегов */}
          <div className="flex items-center gap-3 border p-3 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <FiTag className="w-5 h-5 text-teal-500 dark:text-teal-400" /> {/* ИЗМЕНЕНО: Цвет иконки */}
            <input
              type="text"
              placeholder="Ключевые слова (разделяйте запятыми: ремонт, авто, услуга)" // ИЗМЕНЕНО: Текст заглушка
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-transparent dark:text-gray-200 focus:outline-none"
            />
          </div>

          {/* 4. Tiptap Toolbar (ИЗМЕНЕН ЦВЕТ) */}
          {editor && (
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex gap-3 flex-wrap shadow-inner">
              {[
                ["Жирный", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
                ["Курсив", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
                ["H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 })],
                ["•Список", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
                ["Нумеров.", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")],
                ["Код </>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock")],
              ].map(([label, handler, isActive]) => (
                <button
                  key={label}
                  type="button"
                  onClick={handler}
                  className={TiptapButtonClass(isActive)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* 5. Редактор */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl min-h-[300px] shadow-inner">
            <EditorContent editor={editor} />
          </div>

          {/* 6. Изображение и Настройки Публичности (Один ряд) */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            
            {/* Флажок для публичности (для модерации/статуса, хотя объявления обычно публичные) */}
            <div className={`flex items-center space-x-3 p-3 rounded-lg w-full sm:w-1/2 cursor-pointer 
                            transition duration-200 ${isPublic 
                              ? 'bg-teal-100 dark:bg-teal-900 border border-teal-500' // ИЗМЕНЕНО: Цвет
                              : 'bg-gray-100 dark:bg-gray-700 border border-transparent hover:border-teal-300'}`} // ИЗМЕНЕНО: Цвет
                 onClick={() => setIsPublic(!isPublic)}>
              
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="hidden" 
              />
              {isPublic ? (
                  <FiUnlock className="w-5 h-5 text-teal-600" /> // ИЗМЕНЕНО: Цвет
              ) : (
                  <FiLock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
              <label htmlFor="isPublic" className="text-gray-800 dark:text-gray-200 font-medium select-none">
                {isPublic ? "Активно (Отображается на доске)" : "Черновик (Только для вас)"} {/* ИЗМЕНЕНО: Текст */}
              </label>
            </div>
            
            {/* Загрузка Изображения (ИЗМЕНЕН ЦВЕТ) */}
            <label 
                htmlFor="image-upload" 
                className={`flex items-center justify-center w-full sm:w-1/2 p-3 rounded-lg font-medium cursor-pointer transition duration-200 
                          ${imageUrl ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 border border-teal-500' : 'bg-teal-500 text-white hover:bg-teal-600'}`}>
                <FiImage className="w-5 h-5 mr-2" />
                {imageUrl ? "Фото товара загружено" : "Загрузить фото товара"} {/* ИЗМЕНЕНО: Текст */}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        handleImageUpload(file);
                    }}
                    className="hidden"
                />
            </label>
          </div>
          {/* Конец ряда */}

          {/* Image Preview (без изменений) */}
          {imageUrl && (
            <div className="relative border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-2">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full max-h-64 object-contain rounded-lg"
              />
              <button 
                type="button" 
                onClick={() => setImageUrl("")}
                className="absolute top-4 right-4 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700 transition"
              >
                  X
              </button>
            </div>
          )}


          {/* Кнопка Отправки (ИЗМЕНЕН ЦВЕТ) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 text-lg font-bold rounded-xl shadow-lg hover:bg-teal-700 transition duration-300 transform hover:-translate-y-0.5" // ИЗМЕНЕНО: pink -> teal
          >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Сохранение...
                </>
            ) : (
                <>
                    <FiSend className="w-5 h-5" />
                    Разместить Объявление
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAd;