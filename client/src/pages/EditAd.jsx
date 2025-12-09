import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import toast, { Toaster } from "react-hot-toast";
import { FiSave, FiTag, FiImage, FiX, FiDollarSign, FiMapPin, FiMenu } from "react-icons/fi"; // Добавлена FiMenu

// Классы для стилизации кнопок Tiptap (Обновлено для Soft UI)
const TiptapButtonClass = (isActive) => 
  `p-2 rounded-lg text-sm font-medium transition duration-200 shadow-md 
   ${isActive 
     ? "bg-teal-500 text-white hover:bg-teal-600 shadow-teal-300/50" 
     : "bg-white text-gray-700 hover:bg-gray-100 shadow-gray-200"
   }`;
  
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

const EditAd = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("content"); 
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Введите подробное описание товара или услуги...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        // Стиль для светлого UI
        class: "prose max-w-none focus:outline-none p-4 text-gray-800 min-h-[400px]", 
      },
    },
  });

  // Fetch existing ad
  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/ads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch advertisement");

        const data = await res.json();
        setTitle(data.title || "");
        setPrice(data.price?.toString() || "");
        setLocation(data.location || "");
        setTags(data.tags?.join(", ") || "");
        setImageUrl(data.imageUrl || "");
        editor?.commands.setContent(data.content || "");
      } catch (err) {
        toast.error("Не удалось загрузить объявление для редактирования");
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (editor && id) fetchAd();
  }, [editor, id]);

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/upload/ad-image", { 
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Загрузка изображения не удалась");

      const data = await res.json();
      setImageUrl(data.imageUrl);
      toast.success("Изображение успешно загружено!");
    } catch (err) {
      toast.error("Ошибка загрузки изображения");
      console.error("Image upload error:", err.message);
    } finally {
        setLoading(false);
    }
  };

  // Handle update ad
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !editor?.getText().trim() || !price.trim()) {
        toast.error("Заголовок, Цена и Описание не могут быть пустыми.");
        return;
    }

    const content = editor.getHTML();
    const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    const parsedPrice = parseFloat(price);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8080/api/ads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            title, 
            content, 
            tags: tagArray, 
            imageUrl, 
            price: parsedPrice,
            location
        }),
      });

      if (!res.ok) throw new Error("Failed to update advertisement");

      toast.success("Объявление успешно обновлено!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error("Ошибка обновления объявления");
      console.error("Update error:", err.message);
    } finally {
        setLoading(false);
    }
  };

  // --- HTML для вкладки "Метаданные/Медиа" (СТИЛЬ SOFT UI) ---
  const MetadataTab = (
    <div className="space-y-6 p-6">
        
        {/* Цена и Локация */}
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Поле Цены */}
            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl w-full sm:w-1/2 shadow-inner">
                <FiDollarSign className="w-5 h-5 text-teal-600" />
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
                <FiMapPin className="w-5 h-5 text-teal-600" />
                <input
                type="text"
                placeholder="Город или адрес"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-gray-800 focus:outline-none"
                />
            </div>
        </div>

        {/* Tags Input */}
        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl shadow-inner">
            <FiTag className="w-5 h-5 text-teal-600" />
            <input
                type="text"
                placeholder="Ключевые слова (через запятую)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-transparent text-gray-800 focus:outline-none"
            />
        </div>

        {/* Image Upload/Preview */}
        <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl p-4 shadow-md">
            <label 
                htmlFor="image-upload" 
                // Стиль кнопки загрузки Soft UI
                className={`flex items-center justify-center w-full p-3 rounded-xl font-bold cursor-pointer transition duration-200 
                          shadow-lg hover:shadow-xl
                          ${imageUrl 
                            ? 'bg-teal-100 text-teal-700 border border-teal-500 shadow-teal-200' 
                            : 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-400/50'}`}>
                <FiImage className="w-5 h-5 mr-2" />
                {imageUrl ? "Фото товара загружено (Нажмите для смены)" : "Загрузить новое фото товара"}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="hidden"
                />
            </label>

            {/* Image Preview */}
            {imageUrl && (
                <div className="relative mt-4 bg-gray-50 p-2 rounded-lg shadow-inner">
                    <img
                        src={imageUrl}
                        alt="Ad Cover"
                        className="w-full max-h-64 object-contain rounded-lg"
                    />
                    <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full font-bold text-sm hover:bg-red-600 transition shadow-lg"
                        title="Удалить изображение"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    </div>
  );

  if (!editor || loading) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
            <div className="flex items-center text-lg text-teal-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {loading ? "Загрузка данных объявления..." : "Инициализация редактора..."}
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50"> {/* Светлый фон страницы */}
      <Toaster position="top-right" />
      {/* Главный контейнер Soft UI */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-gray-300/60 overflow-hidden">
        
        {/* Заголовок Рабочей Области */}
        <header className="p-4 border-b border-gray-100 flex items-center gap-3">
            <FiMenu className="w-6 h-6 text-teal-500" />
            <h2 className="text-xl font-extrabold text-gray-900">
                Редактирование: <span className="text-teal-600">{title || "Безымянное объявление"}</span>
            </h2>
        </header>

        <form onSubmit={handleUpdate}>
            
            {/* Поле Заголовка (В стиле Soft UI) */}
            <div className="p-4 border-b border-gray-100">
                <input
                    type="text"
                    placeholder="Заголовок объявления"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    // Стиль, как в CreateAd: легкий фон, скругление, фокус-кольцо
                    className="w-full px-4 py-3 text-2xl font-bold bg-gray-100 rounded-xl border border-transparent 
                               focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white 
                               transition duration-200 shadow-inner placeholder-gray-500"
                    required
                />
            </div>

            {/* Навигация по вкладкам (Стиль Soft UI) */}
            <div className="flex border-b border-gray-100">
                <button
                    type="button"
                    onClick={() => setActiveTab("content")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 
                        ${activeTab === "content" 
                            ? "border-b-4 border-teal-500 text-teal-600 bg-teal-50"
                            : "text-gray-600 hover:bg-gray-100"}`}
                >
                    Описание (Содержание)
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 
                        ${activeTab === "media" 
                            ? "border-b-4 border-teal-500 text-teal-600 bg-teal-50"
                            : "text-gray-600 hover:bg-gray-100"}`}
                >
                    Цена / Медиа / Категории
                </button>
            </div>

            {/* Контент вкладок */}
            <div className="p-0">
                {activeTab === "content" && (
                    <div className="space-y-4">
                        {/* Editor Toolbar (Soft UI) */}
                        <div className="bg-white rounded-t-xl border-b border-gray-200 shadow-inner">
                            <TiptapToolbar editor={editor} />
                        </div>
                        {/* Editor Content */}
                        <div className="bg-white min-h-[400px]">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                )}

                {activeTab === "media" && MetadataTab}
            </div>

            {/* Кнопка Сохранения (Акцентная Soft UI) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 font-bold rounded-2xl 
                               shadow-xl shadow-teal-400/50 hover:bg-teal-700 transition duration-300 transform hover:-translate-y-1 disabled:opacity-50"
                >
                    <FiSave className="w-5 h-5" />
                    {loading ? "Сохранение..." : "Сохранить объявление"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditAd;