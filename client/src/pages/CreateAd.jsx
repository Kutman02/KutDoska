// src/components/CreateAd.jsx
import { useState, useEffect } from "react"; // 💡 Добавлен useEffect
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FiImage, FiTag, FiLock, FiUnlock, FiSend, FiDollarSign, FiMapPin, FiBriefcase, FiPhone, FiX } from "react-icons/fi"; // 💡 Добавлена FiBriefcase для категории
import toast from "react-hot-toast";

// Классы для стилизации кнопок Tiptap
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
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState([]); // Массив для нескольких изображений
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  
  // 💡 НОВОЕ СОСТОЯНИЕ ДЛЯ КАТЕГОРИЙ
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // 1. 🗂️ Загрузка всех Главных Категорий
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/categories");
            if (!response.ok) {
                throw new Error("Не удалось загрузить категории.");
            }
            const data = await response.json(); 
            setCategories(data);
            // Устанавливаем первую категорию по умолчанию, если они есть
            if (data.length > 0) {
                setSelectedCategoryId(data[0]._id);
            }
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
            toast.error("Ошибка при загрузке структуры категорий.");
        }
    };
    fetchCategories();
  }, []); 

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Введите подробное описание товара или услуги. Укажите состояние, характеристики и условия сделки...</p>",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none p-4 text-gray-800 min-h-[250px]", 
      },
    },
  });

  const handleImageUpload = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Ограничиваем количество изображений до 5
    const filesToUpload = Array.from(selectedFiles).slice(0, 5 - images.length);
    
    if (filesToUpload.length === 0) {
      alert("Можно загрузить максимум 5 изображений");
      return;
    }

    try {
      setLoading(true);
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8080/api/upload/ad-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Не удалось загрузить изображение");
        const data = await res.json();
        return data.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editor?.getText();

    if (!title.trim() || !content.trim() || !price.trim() || !selectedCategoryId) { // 💡 Проверка категории
      alert("Пожалуйста, заполните Заголовок, Цену, Описание и выберите Категорию.");
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
            content: editor.getHTML(), 
            price: parseFloat(price),
            location,
            phone,
            images: images.length > 0 ? images : [],
            imageUrl: images.length > 0 ? images[0] : "",
            tags: tagArray,
            isPublic,
            category: selectedCategoryId, // 💡 ОТПРАВКА ID КАТЕГОРИИ
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
  
  // Компонент меню редактора (остается без изменений)
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
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-teal-500/50 pb-2">
          Разместить Новое Объявление
        </h2>

        <form onSubmit={handleSubmit} 
              className="space-y-6 p-8 bg-white rounded-3xl shadow-2xl shadow-gray-300/60">
          
          {/* 1. Заголовок */}
          <div className="relative">
            <input
              type="text"
              placeholder="Название товара или услуги (обязательно)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-xl font-semibold text-gray-900 
                         bg-gray-100 rounded-xl border border-transparent 
                         focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                         transition duration-200 shadow-inner placeholder-gray-500"
              required
            />
          </div>

          {/* 2. Категория, Цена, Локация (Разбиты на 2 ряда для лучшей адаптивности) */}

          {/* 2.1. Выбор Категории */}
          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl shadow-inner">
            <FiBriefcase className="w-5 h-5 text-teal-500" />
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full bg-transparent text-gray-800 focus:outline-none appearance-none cursor-pointer"
              required
            >
              {categories.length === 0 ? (
                <option value="" disabled>Загрузка категорий...</option>
              ) : (
                categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 2.2. Цена и Локация */}
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

          {/* Поле Телефона */}
          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl shadow-inner">
            <FiPhone className="w-5 h-5 text-teal-500" />
            <input
              type="tel"
              placeholder="Номер телефона (например: +996 555 123456)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-gray-800 focus:outline-none"
            />
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

          {/* 4. Редактор */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/50">
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          {/* 5. Изображение и Настройки Публичности */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            
            {/* Флажок публичности */}
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
            
            {/* Загрузка Изображений */}
            <label 
                htmlFor="image-upload" 
                className={`flex items-center justify-center w-full sm:w-1/2 p-3 rounded-xl font-bold cursor-pointer transition duration-200 
                          shadow-lg hover:shadow-xl
                          ${images.length > 0 
                            ? 'bg-teal-100 text-teal-700 border border-teal-500 shadow-teal-200' 
                            : 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-400/50'}`}>
                <FiImage className="w-5 h-5 mr-2" />
                {images.length > 0 ? `Загружено ${images.length}/5 фото` : "Загрузить фото товара (до 5 шт.)"}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const files = e.target.files;
                        handleImageUpload(files);
                    }}
                    className="hidden"
                />
            </label>
          </div>
          {/* Конец ряда */}

          {/* Images Preview Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((imgUrl, index) => (
                <div key={index} className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-2 shadow-inner">
                  <img
                    src={imgUrl}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg shadow-md"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full font-bold text-xs hover:bg-red-600 transition shadow-lg"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{images.length}
                  </div>
                </div>
              ))}
            </div>
          )}


          {/* Кнопка Отправки */}
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