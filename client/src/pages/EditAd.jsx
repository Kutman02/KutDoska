import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import toast, { Toaster } from "react-hot-toast";
import { FiSave, FiTag, FiImage, FiX, FiDollarSign, FiMapPin } from "react-icons/fi"; // ДОБАВЛЕНО: FiDollarSign, FiMapPin

// Классы для стилизации кнопок Tiptap
const TiptapButtonClass = (isActive) => 
  `p-2 rounded-md text-sm font-medium transition duration-200 
   ${isActive 
     ? "bg-teal-600 text-white shadow-md hover:bg-teal-700" // ИЗМЕНЕНО: lime -> teal
     : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
   }`;

const EditAd = () => { // ИЗМЕНЕНО: EditNotes -> EditAd
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(""); // ДОБАВЛЕНО: Цена
  const [location, setLocation] = useState(""); // ДОБАВЛЕНО: Локация
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("content"); 
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Введите подробное описание товара или услуги...", // ИЗМЕНЕНО: Заметка -> Описание
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none p-4", 
      },
    },
  });

  // Fetch existing ad
  useEffect(() => {
    const fetchAd = async () => { // ИЗМЕНЕНО: fetchNote -> fetchAd
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // ИЗМЕНЕНО: /api/notes/ -> /api/ads/
        const res = await fetch(`http://localhost:8080/api/ads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch advertisement"); // ИЗМЕНЕНО: note -> advertisement

        const data = await res.json();
        setTitle(data.title || "");
        setPrice(data.price?.toString() || ""); // ДОБАВЛЕНО: Загрузка цены
        setLocation(data.location || ""); // ДОБАВЛЕНО: Загрузка локации
        setTags(data.tags?.join(", ") || "");
        setImageUrl(data.imageUrl || "");
        editor?.commands.setContent(data.content || "");
      } catch (err) {
        toast.error("Не удалось загрузить объявление для редактирования"); // ИЗМЕНЕНО: заметку -> объявление
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
      // ИЗМЕНЕНО: URL, если нужно, иначе оставляем как заглушку
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

    if (!title.trim() || !editor?.getText().trim() || !price.trim()) { // ДОБАВЛЕНО: Проверка цены
        toast.error("Заголовок, Цена и Описание не могут быть пустыми.");
        return;
    }

    const content = editor.getHTML();
    const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    const parsedPrice = parseFloat(price);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // ИЗМЕНЕНО: /api/notes/ -> /api/ads/
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
            price: parsedPrice, // ДОБАВЛЕНО: цена
            location // ДОБАВЛЕНО: локация
        }),
      });

      if (!res.ok) throw new Error("Failed to update advertisement");

      toast.success("Объявление успешно обновлено!"); // ИЗМЕНЕНО: Заметка -> Объявление
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error("Ошибка обновления объявления"); // ИЗМЕНЕНО: обновления -> обновления объявления
      console.error("Update error:", err.message);
    } finally {
        setLoading(false);
    }
  };

  // --- HTML для вкладки "Метаданные/Медиа" ---
  const MetadataTab = (
    <div className="space-y-4 p-4">
        
        {/* Цена и Локация (ДОБАВЛЕНО) */}
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Поле Цены */}
            <div className="flex items-center gap-3 border p-3 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 w-full sm:w-1/2">
                <FiDollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {/* ИЗМЕНЕНО: Цвет */}
                <input
                type="number"
                placeholder="Цена (в сомах)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent dark:text-gray-200 focus:outline-none appearance-none"
                required
                />
            </div>
            {/* Поле Локации */}
            <div className="flex items-center gap-3 border p-3 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 w-full sm:w-1/2">
                <FiMapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {/* ИЗМЕНЕНО: Цвет */}
                <input
                type="text"
                placeholder="Город или адрес"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent dark:text-gray-200 focus:outline-none"
                />
            </div>
        </div>


        {/* Tags Input */}
        <div className="flex items-center gap-3 border p-3 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <FiTag className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {/* ИЗМЕНЕНО: Цвет */}
            <input
                type="text"
                placeholder="Ключевые слова (через запятую)" // ИЗМЕНЕНО: Текст заглушка
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-transparent dark:text-gray-200 focus:outline-none"
            />
        </div>

        {/* Image Upload */}
        <div className="border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4">
            <label 
                htmlFor="image-upload" 
                className={`flex items-center justify-center w-full p-3 rounded-lg font-medium cursor-pointer transition duration-200 
                          ${imageUrl ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 border border-teal-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}> {/* ИЗМЕНЕНО: lime -> teal */}
                <FiImage className="w-5 h-5 mr-2" />
                {imageUrl ? "Фото товара загружено (Нажмите для смены)" : "Загрузить новое фото товара"} {/* ИЗМЕНЕНО: Текст */}
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
                <div className="relative mt-4">
                    <img
                        src={imageUrl}
                        alt="Ad Cover" // ИЗМЕНЕНО: Note Cover -> Ad Cover
                        className="w-full max-h-64 object-contain rounded-lg"
                    />
                    <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700 transition flex items-center justify-center w-6 h-6"
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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center text-lg text-teal-600 dark:text-teal-400"> {/* ИЗМЕНЕНО: lime -> teal */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {loading ? "Загрузка данных объявления..." : "Инициализация редактора..."} {/* ИЗМЕНЕНО: заметки -> объявления */}
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-950">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Заголовок Рабочей Области */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Редактирование: <span className="text-teal-600 dark:text-teal-400">{title || "Безымянное объявление"}</span> {/* ИЗМЕНЕНО: lime -> teal, заметка -> объявление */}
            </h2>
        </header>

        <form onSubmit={handleUpdate}>
            
            {/* Поле Заголовка */}
            <div className="p-4 border-b dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Заголовок объявления" // ИЗМЕНЕНО: заметки -> объявления
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 text-2xl font-bold bg-transparent dark:text-white focus:outline-none"
                    required
                />
            </div>

            {/* Навигация по вкладкам */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveTab("content")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 
                        ${activeTab === "content" 
                            ? "border-b-4 border-teal-500 text-teal-600 dark:text-teal-400" // ИЗМЕНЕНО: lime -> teal
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                >
                    Описание (Содержание)
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 
                        ${activeTab === "media" 
                            ? "border-b-4 border-teal-500 text-teal-600 dark:text-teal-400" // ИЗМЕНЕНО: lime -> teal
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                >
                    Цена / Медиа / Категории
                </button>
            </div>

            {/* Контент вкладок */}
            <div className="p-0">
                {activeTab === "content" && (
                    <div className="space-y-4">
                        {/* Toolbar (ИЗМЕНЕН ЦВЕТ) */}
                        {editor && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 shadow-inner flex gap-2 flex-wrap border-b dark:border-gray-600">
                                {/* Кнопки используют TiptapButtonClass, который уже изменен на teal */}
                                {[
                                    ["Жирный", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
                                    ["Курсив", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
                                    ["H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 })],
                                    ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
                                    ["•Список", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
                                    ["</>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock")],
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

                        {/* Editor Content */}
                        <div className="bg-white dark:bg-gray-800 min-h-[400px]">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                )}

                {activeTab === "media" && MetadataTab}
            </div>

            {/* Кнопка Сохранения (ИЗМЕНЕН ЦВЕТ) */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 font-bold rounded-lg shadow-lg hover:bg-teal-700 transition disabled:bg-gray-400" // ИЗМЕНЕНО: lime -> teal
                >
                    <FiSave className="w-5 h-5" />
                    {loading ? "Сохранение..." : "Сохранить объявление"} {/* ИЗМЕНЕНО: изменения -> объявление */}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditAd;