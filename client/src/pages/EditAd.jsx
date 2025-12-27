import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import toast, { Toaster } from "react-hot-toast";
import { FiSave, FiTag, FiImage, FiX, FiDollarSign, FiMapPin, FiMenu, FiPhone, FiBriefcase } from "react-icons/fi";
import Breadcrumb from "../components/Breadcrumb";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAdById, updateAd } from "../store/slices/adsSlice";
import { fetchCategories, fetchSubcategories } from "../store/slices/categoriesSlice";

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

  const dispatch = useAppDispatch();
  const { currentAd, loading: adsLoading } = useAppSelector((state) => state.ads);
  const { categories, subcategories } = useAppSelector((state) => state.categories);

  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [hidePhone, setHidePhone] = useState(false);
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("content"); 
  const [loading, setLoading] = useState(false);
  
  // Категории и локации
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");

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

  // Загрузка категорий и локаций
  useEffect(() => {
    dispatch(fetchCategories());
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/locations");
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки локаций:", error);
      }
    };
    fetchLocations();
  }, [dispatch]);

  // Загрузка подкатегорий при изменении категории
  useEffect(() => {
    if (selectedCategoryId) {
      dispatch(fetchSubcategories(selectedCategoryId));
    }
  }, [selectedCategoryId, dispatch]);

  // Fetch existing ad
  useEffect(() => {
    if (editor && id) {
      dispatch(fetchAdById(id));
    }
  }, [editor, id, dispatch]);

  // Обновление формы при загрузке объявления
  useEffect(() => {
    if (currentAd) {
      setPrice(currentAd.price?.toString() || "");
      setLocation(currentAd.location || "");
      setPhone(currentAd.phone || "");
      setHidePhone(currentAd.hidePhone || false);
      setTags(currentAd.tags?.join(", ") || "");
      setImages(currentAd.images && currentAd.images.length > 0 ? currentAd.images : (currentAd.imageUrl ? [currentAd.imageUrl] : []));
      setSelectedCategoryId(currentAd.category?._id || currentAd.category || "");
      setSelectedSubcategoryId(currentAd.subcategory?._id || currentAd.subcategory || "");
      setSelectedCityId(currentAd.locationId?._id || currentAd.locationId || "");
      editor?.commands.setContent(currentAd.content || "");
    }
  }, [currentAd, editor]);

  // Handle image upload
  const handleImageUpload = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Ограничиваем количество изображений до 5
    const filesToUpload = Array.from(selectedFiles).slice(0, 5 - images.length);
    
    if (filesToUpload.length === 0) {
      toast.error("Можно загрузить максимум 5 изображений");
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
      toast.success(`Загружено ${uploadedUrls.length} изображений!`);
    } catch (err) {
      toast.error("Ошибка загрузки изображений");
      console.error("Image upload error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // Handle update ad
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editor?.getText().trim()) {
        toast.error("Описание не может быть пустым.");
        return;
    }

    if (images.length === 0) {
        toast.error("Необходимо загрузить хотя бы одно изображение.");
        return;
    }

    if (!phone || phone.trim() === "") {
        toast.error("Номер телефона обязателен.");
        return;
    }

    if (!selectedCategoryId) {
        toast.error("Пожалуйста, выберите категорию.");
        return;
    }

    if (!selectedCityId) {
        toast.error("Пожалуйста, выберите город.");
        return;
    }

    const content = editor.getHTML();
    const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    const finalPrice = price && parseFloat(price) > 0 ? parseFloat(price) : 0;
    const generatedTitle = content.trim().substring(0, 100) || "Объявление";

    setLoading(true);
    const result = await dispatch(updateAd({
      id,
      adData: {
        title: generatedTitle,
        content, 
        tags: tagArray, 
        images: images.length > 0 ? images : [],
        imageUrl: images.length > 0 ? images[0] : "",
        price: finalPrice,
        location,
        phone,
        hidePhone,
        locationId: selectedCityId,
        category: selectedCategoryId,
        subcategory: selectedSubcategoryId || null,
      }
    }));

    setLoading(false);

    if (updateAd.fulfilled.match(result)) {
      toast.success("Объявление успешно обновлено!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      toast.error(result.payload || "Ошибка обновления объявления");
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
                placeholder="Цена (в сомах) или 0 для 'Договорная'"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent text-gray-800 focus:outline-none appearance-none"
                min="0"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">Если 0 или не указано, будет отображаться "Договорная"</p>
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

        {/* Phone Input */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Номер телефона <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-xl shadow-inner">
                <FiPhone className="w-5 h-5 text-teal-600" />
                <input
                    type="tel"
                    placeholder="Номер телефона (например: +996 555 123456)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent text-gray-800 focus:outline-none"
                    required
                />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="hidePhone"
                checked={hidePhone}
                onChange={(e) => setHidePhone(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="hidePhone" className="text-sm text-gray-700 cursor-pointer">
                Скрыть номер телефона
              </label>
            </div>
        </div>

        {/* Categories and Locations */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Категория <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <FiBriefcase className="w-5 h-5 text-teal-500" />
              <select 
                value={selectedCategoryId} 
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSelectedSubcategoryId("");
                }} 
                className="w-full bg-transparent outline-none cursor-pointer text-gray-700" 
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedCategoryId && subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Подкатегория</label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <FiBriefcase className="w-5 h-5 text-teal-500" />
                <select 
                  value={selectedSubcategoryId} 
                  onChange={(e) => setSelectedSubcategoryId(e.target.value)} 
                  className="w-full bg-transparent outline-none cursor-pointer text-gray-700"
                >
                  <option value="">Выберите подкатегорию</option>
                  {subcategories.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Город <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <FiMapPin className="w-5 h-5 text-teal-500" />
              <select 
                value={selectedCityId} 
                onChange={(e) => setSelectedCityId(e.target.value)} 
                className="w-full bg-transparent outline-none cursor-pointer text-gray-700" 
                required
              >
                <option value="">Выберите город</option>
                {locations.map(city => (
                  <option key={city._id} value={city._id}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload/Preview */}
        <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl p-4 shadow-md">
            <label 
                htmlFor="image-upload" 
                // Стиль кнопки загрузки Soft UI
                className={`flex items-center justify-center w-full p-3 rounded-xl font-bold cursor-pointer transition duration-200 
                          shadow-lg hover:shadow-xl
                          ${images.length > 0 
                            ? 'bg-teal-100 text-teal-700 border border-teal-500 shadow-teal-200' 
                            : 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-400/50'}`}>
                <FiImage className="w-5 h-5 mr-2" />
                {images.length > 0 ? `Загружено ${images.length}/5 фото (Нажмите для добавления)` : "Загрузить фото товара (до 5 шт.)"}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                />
            </label>

            {/* Images Preview Gallery */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {images.map((imgUrl, index) => (
                        <div key={index} className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-2 shadow-inner">
                            <img
                                src={imgUrl}
                                alt={`Ad Image ${index + 1}`}
                                className="w-full h-40 object-cover rounded-lg shadow-md"
                            />
                            <button 
                                type="button" 
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full font-bold text-xs hover:bg-red-600 transition shadow-lg"
                                title="Удалить изображение"
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
        </div>
    </div>
  );

  if (!editor || loading || adsLoading) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
            <div className="flex items-center text-lg text-teal-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {loading ? "Загрузка данных объявления..." : "Инициализация редактора..."}
            </div>
        </div>
    );
  }

  // Формируем breadcrumb items
  const contentPreview = editor?.getText() || "";
  const breadcrumbTitle = contentPreview.length > 30 ? contentPreview.substring(0, 30) + "..." : contentPreview || "Редактирование";
  const breadcrumbItems = [
    { label: "Панель управления", path: "/dashboard" },
    { label: "Мои объявления", path: "/dashboard?tab=ads" },
    { label: breadcrumbTitle, path: `/edit-ad/${id}` }
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50"> {/* Светлый фон страницы */}
      <Toaster position="top-right" />
      {/* Главный контейнер Soft UI */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-gray-300/60 overflow-hidden">
        
        {/* Breadcrumb */}
        <div className="p-4 border-b border-gray-100">
          <Breadcrumb items={breadcrumbItems} showHomeIcon={true} />
        </div>

        {/* Заголовок Рабочей Области */}
        <header className="p-4 border-b border-gray-100 flex items-center gap-3">
            <FiMenu className="w-6 h-6 text-teal-500" />
            <h2 className="text-xl font-extrabold text-gray-900">
                Редактирование объявления
            </h2>
        </header>

        <form onSubmit={handleUpdate}>
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
                    Описание <span className="text-red-500">*</span>
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