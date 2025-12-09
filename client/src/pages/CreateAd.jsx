// src/components/CreateAd.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FiImage, FiTag, FiLock, FiUnlock, FiSend, FiDollarSign, FiMapPin } from "react-icons/fi";

// Классы для стилизации кнопок Tiptap (Обновлено для Soft UI)
const TiptapButtonClass = (isActive) => 
  `p-2 rounded-lg text-sm font-medium transition duration-200 shadow-md 
   ${isActive 
     ? "bg-teal-500 text-white hover:bg-teal-600 shadow-teal-300/50" 
     : "bg-white text-gray-700 hover:bg-gray-100 shadow-gray-200"
   }`;

const CreateAd = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(""); 
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Введите подробное описание товара или услуги. Укажите состояние, характеристики и условия сделки...</p>",
    editorProps: {
      attributes: {
        // Убрана темная тема, добавлены стили для светлого фона
        class: "prose max-w-none focus:outline-none p-4 text-gray-800 min-h-[250px]", 
      },
    },
  });

  const handleImageUpload = async (selectedFile) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
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

    if (!title.trim() || !content.trim() || !price.trim()) {
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
            content: editor.getHTML(), // Используем HTML контент
            price: parseFloat(price),
            location,
            imageUrl,
            tags: tagArray,
            isPublic, 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось создать объявление.");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Ошибка при создании объявления:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Компонент меню редактора (обязателен для Tiptap)
  const TiptapToolbar = ({ editor }) => {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={TiptapButtonClass(editor.isActive('heading', { level: 1 }))}
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={TiptapButtonClass(editor.isActive('heading', { level: 2 }))}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={TiptapButtonClass(editor.isActive('bold'))}
            >
                B
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={TiptapButtonClass(editor.isActive('italic'))}
            >
                I
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={TiptapButtonClass(editor.isActive('bulletList'))}
            >
                • List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={TiptapButtonClass(editor.isActive('orderedList'))}
            >
                # List
            </button>
        </div>
    );
  };

  return (
    // Общий фон страницы
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        
        {/* Заголовок */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-teal-500/50 pb-2">
          Разместить Новое Объявление
        </h2>

        {/* Форма обернута в карточку (Soft UI) */}
        <form onSubmit={handleSubmit} 
              // Классический Soft UI контейнер
              className="space-y-6 p-8 bg-white rounded-3xl shadow-2xl shadow-gray-300/60">
          
          {/* 1. Заголовок (Отдельное поле, без фона, но с акцентом фокуса) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Название товара или услуги (обязательно)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              // Стиль: убрана нижняя граница, фокус - мягкое кольцо
              className="w-full px-4 py-3 text-xl font-semibold text-gray-900 
                         bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         transition duration-200 shadow-inner placeholder-gray-500"
              required
            />
          </div>

          {/* 2. Цена и Локация (В одном ряду, Soft UI) */}
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* Поле Цены */}
            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl w-full sm:w-1/2 shadow-inner">
                <FiDollarSign className="w-5 h-5 text-teal-500" />
                <input
                type="number"
                placeholder="Цена (в сомах)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent text-gray-800 focus:outline-none appearance-none"
                required
                />
            </div>

            {/* Поле Локации */}
            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl w-full sm:w-1/2 shadow-inner">
                <FiMapPin className="w-5 h-5 text-teal-500" />
                <input
                type="text"
                placeholder="Город или адрес"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-gray-800 focus:outline-none"
                />
            </div>

          </div>

          {/* 3. Поле Тегов */}
          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl shadow-inner">
            <FiTag className="w-5 h-5 text-teal-500" />
            <input
              type="text"
              placeholder="Ключевые слова (разделяйте запятыми: ремонт, авто, услуга)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-transparent text-gray-800 focus:outline-none"
            />
          </div>

          {/* 4. Редактор (Собственный Soft UI контейнер) */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/50">
            {/* Панель инструментов */}
            <TiptapToolbar editor={editor} />
            {/* Область контента */}
            <EditorContent editor={editor} />
          </div>

          {/* 5. Изображение и Настройки Публичности (Один ряд, Soft UI) */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            
            {/* Флажок публичности (Soft UI, активное состояние с тенью) */}
            <div className={`flex items-center space-x-3 p-3 rounded-xl w-full sm:w-1/2 cursor-pointer 
                            transition duration-200 border-2 
                            ${isPublic 
                              ? 'bg-teal-50 border-teal-400 shadow-md shadow-teal-100'
                              : 'bg-gray-100 border-gray-200 shadow-inner'}`}
                 onClick={() => setIsPublic(!isPublic)}>
              
              {isPublic ? (
                  <FiUnlock className="w-5 h-5 text-teal-600" />
              ) : (
                  <FiLock className="w-5 h-5 text-gray-500" />
              )}
              <span className="text-gray-800 font-medium select-none">
                {isPublic ? "Активно (Отображается)" : "Черновик (Не опубликовано)"}
              </span>
            </div>
            
            {/* Загрузка Изображения (Акцентная кнопка) */}
            <label 
                htmlFor="image-upload" 
                className={`flex items-center justify-center w-full sm:w-1/2 p-3 rounded-xl font-bold cursor-pointer transition duration-200 
                          shadow-lg hover:shadow-xl
                          ${imageUrl 
                            ? 'bg-teal-100 text-teal-700 border border-teal-500 shadow-teal-200' 
                            : 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-400/50'}`}>
                <FiImage className="w-5 h-5 mr-2" />
                {imageUrl ? "Фото товара загружено" : "Загрузить фото товара"}
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

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative border-4 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4 shadow-inner">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full max-h-80 object-contain rounded-lg shadow-md"
              />
              <button 
                type="button" 
                onClick={() => setImageUrl("")}
                className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full font-bold text-sm hover:bg-red-600 transition shadow-lg"
              >
                  X
              </button>
            </div>
          )}


          {/* Кнопка Отправки (Акцентная, с сильной тенью) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 text-lg font-bold rounded-2xl 
                       shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition duration-300 transform hover:-translate-y-1"
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