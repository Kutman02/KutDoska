import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiSave, FiMapPin, FiPhone, FiBriefcase } from "react-icons/fi";
import { TbCircleLetterC } from "react-icons/tb";
import Breadcrumb from "../components/Breadcrumb";
import AdEditor from "../components/CreateAd/AdEditor";
import ImageUploader from "../components/CreateAd/ImageUploader";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAdById, updateAd } from "../store/slices/adsSlice";
import { fetchCategories, fetchSubcategories } from "../store/slices/categoriesSlice";
import type { Category } from "../types/category.types";
import type { Location } from "../types/location.types";
import type { BreadcrumbItem } from "../types/component.types";

const EditAd: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { currentAd, loading: adsLoading } = useAppSelector((state) => state.ads);
  const { categories, subcategories } = useAppSelector((state) => state.categories);

  const PHONE_PREFIX = "+996";
  
  // Извлекаем только цифры из сохраненного номера (если есть)
  const extractPhoneDigits = (phoneStr: string): string => {
    if (!phoneStr) return "";
    const digits = phoneStr.replace(/\D/g, "");
    if (digits.startsWith("996") && digits.length > 3) {
      return digits.substring(3);
    }
    return digits;
  };
  
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [hidePhone, setHidePhone] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Категории и локации
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [districts, setDistricts] = useState<Location[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

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

  // Загрузка подкатегорий
  const fetchSubcategoriesList = async (categoryId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/categories/${categoryId}/subcategories`);
      if (response.ok) {
        const data = await response.json();
        dispatch(fetchSubcategories(categoryId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Загрузка районов при выборе города
  const fetchDistricts = async (cityId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/locations/${cityId}/districts`);
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
        setSelectedDistrictId("");
      }
    } catch (error) {
      console.error(error);
      setDistricts([]);
    }
  };

  // Обработчик изменения категории
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId("");
    if (categoryId) {
      fetchSubcategoriesList(categoryId);
    }
  };

  // Обработчик изменения города
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);
    if (cityId) {
      fetchDistricts(cityId);
    } else {
      setDistricts([]);
      setSelectedDistrictId("");
    }
  };

  // Fetch existing ad
  useEffect(() => {
    if (id) {
      dispatch(fetchAdById(id));
    }
  }, [id, dispatch]);

  // Обновление формы при загрузке объявления
  useEffect(() => {
    if (currentAd) {
      setDescription(currentAd.content || "");
      setPrice(currentAd.price?.toString() || "");
      setLocation(currentAd.location || "");
      setPhoneDigits(extractPhoneDigits(currentAd.phone || ""));
      setHidePhone(currentAd.hidePhone || false);
      setImages(currentAd.images && currentAd.images.length > 0 ? currentAd.images : (currentAd.imageUrl ? [currentAd.imageUrl] : []));
      const categoryId = typeof currentAd.category === 'object' && currentAd.category !== null ? currentAd.category._id : currentAd.category || "";
      setSelectedCategoryId(categoryId);
      if (categoryId) {
        fetchSubcategoriesList(categoryId);
      }
      const subcategoryId = typeof currentAd.subcategory === 'object' && currentAd.subcategory !== null ? currentAd.subcategory._id : currentAd.subcategory || "";
      setSelectedSubcategoryId(subcategoryId);
      const locationId = typeof currentAd.locationId === 'object' && currentAd.locationId !== null ? currentAd.locationId._id : currentAd.locationId || "";
      setSelectedCityId(locationId);
      if (locationId) {
        fetchDistricts(locationId);
      }
    }
  }, [currentAd]);

  // Handle image upload
  const handleImageUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const filesToUpload = Array.from(selectedFiles).slice(0, 5 - images.length);
    
    if (filesToUpload.length === 0) {
      toast.error("Максимум 5 изображений");
      return;
    }

    try {
      setLoading(true);
      const uploadPromises = filesToUpload.map(async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("http://localhost:8080/api/upload/ad-image", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Не удалось загрузить");
        const data = await res.json();
        return data.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки изображений';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ОБРАБОТЧИК ДЛЯ ТЕЛЕФОНА
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 9) {
      setPhoneDigits(value);
      if (value.length === 9) {
        setPhoneError("");
      } else if (value.length > 0) {
        setPhoneError(value.length === 8 ? "Номер должен содержать ровно 9 цифр" : "");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("Номер должен содержать ровно 9 цифр");
    }
  };

  // Handle update ad
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Описание объявления обязательно");
        return;
    }

    if (images.length === 0) {
      toast.error("Необходимо загрузить хотя бы одно изображение");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Необходимо выбрать категорию");
      return;
    }

    if (subcategories.length > 0 && !selectedSubcategoryId) {
      toast.error("Необходимо выбрать подкатегорию");
      return;
    }

    if (!selectedCityId) {
      toast.error("Необходимо выбрать город");
        return;
    }

    // Валидация телефона
    if (!phoneDigits || phoneDigits.length !== 9) {
      setPhoneError("Номер должен содержать ровно 9 цифр");
      toast.error("Номер телефона должен содержать ровно 9 цифр");
      return;
    }

    if (!id) {
      toast.error("ID объявления не найден");
      return;
    }

    try {
    setLoading(true);
      const finalPrice = price && parseFloat(price) > 0 ? parseFloat(price) : 0;
      const generatedTitle = description.trim().substring(0, 100) || "Объявление";

    const result = await dispatch(updateAd({
      id,
      adData: {
        title: generatedTitle,
          content: description,
          tags: [],
        images: images.length > 0 ? images : [],
        imageUrl: images.length > 0 ? images[0] : "",
        price: finalPrice,
        location,
        phone: `${PHONE_PREFIX}${phoneDigits}`,
        hidePhone,
          locationId: selectedDistrictId || selectedCityId,
        category: selectedCategoryId,
        subcategory: selectedSubcategoryId || null,
      }
    }));

    if (updateAd.fulfilled.match(result)) {
      toast.success("Объявление успешно обновлено!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      toast.error(result.payload || "Ошибка обновления объявления");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления объявления';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading || adsLoading || !currentAd) {
    return (
        <div className="min-h-screen w-full p-2 sm:p-4 md:p-8 bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="flex items-center text-lg text-teal-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {loading ? "Сохранение..." : "Загрузка данных объявления..."}
            </div>
        </div>
    );
  }

  // Формируем breadcrumb items
  const contentPreview = description.length > 30 ? description.substring(0, 30) + "..." : description || "Редактирование";
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Панель управления", path: "/dashboard" },
    { label: "Мои объявления", path: "/dashboard?tab=ads" },
    { label: contentPreview, path: `/edit-ad/${id || ''}` }
  ];

  return (
    <div className="min-h-screen w-full p-2 sm:p-4 md:p-8 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <Toaster position="top-right" />
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6 md:mb-8 pb-2">
          Редактирование объявления
        </h2>

        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* ФОТОГРАФИИ на мобильных (показывается первым сверху) */}
          <div className="lg:hidden order-first">
            <div className="w-full">
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                Фотографии <span className="text-red-500">*</span>
              </label>
              <ImageUploader 
                  images={images} 
                  onUpload={handleImageUpload} 
                  onRemove={handleRemoveImage} 
                />
            </div>
          </div>

          {/* Двухколоночный layout для ПК */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* ЛЕВАЯ КОЛОНКА: ФОТОГРАФИИ (только на ПК) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="w-full">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                  Фотографии <span className="text-red-500">*</span>
                </label>
                <ImageUploader 
                    images={images} 
                    onUpload={handleImageUpload} 
                    onRemove={handleRemoveImage} 
                />
            </div>
        </div>

            {/* ПРАВАЯ КОЛОНКА: Остальные поля (только на ПК) */}
            <div className="lg:col-span-1 space-y-6">

              {/* 2. ОПИСАНИЕ */}
              <div>
                 <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                   Описание <span className="text-red-500">*</span>
                 </label>
                 <AdEditor content={description} onChange={setDescription} />
              </div>

              {/* 3. КАТЕГОРИЯ И ПОДКАТЕГОРИЯ */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                      Категория <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-slate-600">
                      <FiBriefcase className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                      <select
                        value={selectedCategoryId}
                        onChange={handleCategoryChange}
                        className="w-full bg-transparent outline-none cursor-pointer text-gray-700 dark:text-slate-200"
                        required
                      >
                        <option value="">Выберите категорию</option>
                        {categories.map((cat: Category) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                      </select>
                  </div>
                </div>

                {/* Подкатегория показывается сразу после выбора категории */}
                {selectedCategoryId && subcategories.length > 0 && (
                  <div className="transition-all duration-300 ease-in-out">
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                        Подкатегория <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-slate-600">
                        <FiBriefcase className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                        <select
                          value={selectedSubcategoryId}
                          onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                          className="w-full bg-transparent outline-none cursor-pointer text-gray-700 dark:text-slate-200"
                          required
                        >
                          <option value="">Выберите подкатегорию</option>
                          {subcategories.map((sub: Category) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                        </select>
                    </div>
                  </div>
                )}

                {/* Сообщение, если у категории нет подкатегорий */}
                {selectedCategoryId && subcategories.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-slate-400 italic ml-1">
                    У этой категории нет подкатегорий. Можно продолжить без выбора подкатегории.
                  </div>
                )}
              </div>

              {/* 4. ГОРОД / РАЙОН */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                      Город <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-slate-600">
                      <FiMapPin className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                      <select
                        value={selectedCityId}
                        onChange={handleCityChange}
                        className="w-full bg-transparent outline-none cursor-pointer text-gray-700 dark:text-slate-200"
                        required
                      >
                        <option value="">Выберите город</option>
                        {locations.map((city: Location) => <option key={city._id} value={city._id}>{city.name}</option>)}
                      </select>
                  </div>
                </div>

                {/* Район (если выбран город с районами) */}
                {districts.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                        Район (необязательно)
                    </label>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-slate-600">
                        <FiMapPin className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                        <select
                          value={selectedDistrictId}
                          onChange={(e) => setSelectedDistrictId(e.target.value)}
                          className="w-full bg-transparent outline-none cursor-pointer text-gray-700 dark:text-slate-200"
                        >
                          <option value="">Не выбрано</option>
                          {districts.map((district: Location) => <option key={district._id} value={district._id}>{district.name}</option>)}
                        </select>
                    </div>
                  </div>
                )}

                {/* Дополнительное текстовое поле для локации */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                      Дополнительная информация о местоположении (необязательно)
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-slate-600">
                      <FiMapPin className="w-5 h-5 text-teal-500 dark:text-teal-400" />
            <input
                type="text"
                          placeholder="Например: ул. Чуй, д. 123" 
                          value={location} 
                          onChange={e => setLocation(e.target.value)} 
                          className="w-full bg-transparent outline-none text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500" 
                      />
                  </div>
                </div>
              </div>

              {/* 5. ЦЕНА */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                    Цена (сом)
                </label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-slate-600">
                    <TbCircleLetterC className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                    <input 
                        type="number" 
                        placeholder="Договорная" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-full bg-transparent outline-none font-medium text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500" 
                        min="0"
                    />
                </div>
        </div>

              {/* 6. НОМЕР ТЕЛЕФОНА */}
        <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 ml-1">
                    Номер телефона <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-md border border-gray-200 dark:border-slate-600">
                    <FiPhone className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                    <span className="text-gray-700 dark:text-slate-300 font-medium">{PHONE_PREFIX}</span>
                <input
                    type="tel"
                    placeholder="703601025"
                    value={phoneDigits}
                    onChange={handlePhoneChange}
                    maxLength={9}
                        className={`flex-1 bg-transparent outline-none text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 ${
                          phoneError ? "border-b-2 border-red-500 dark:border-red-500" : ""
                    }`}
                    required
                />
            </div>
            {phoneError && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 ml-1">{phoneError}</p>
            )}
            {!phoneError && phoneDigits && phoneDigits.length !== 9 && phoneDigits.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 ml-1">
                Введите 9 цифр (осталось {9 - phoneDigits.length})
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="hidePhone"
                checked={hidePhone}
                onChange={(e) => setHidePhone(e.target.checked)}
                    className="w-4 h-4 text-teal-600 dark:text-teal-500 border-gray-300 dark:border-slate-600 rounded focus:ring-teal-500 dark:focus:ring-teal-400 bg-white dark:bg-slate-700"
              />
                  <label htmlFor="hidePhone" className="text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                Скрыть номер телефона
              </label>
            </div>
        </div>
            </div>
          </div>

          {/* Кнопка отправки */}
          <button type="submit" disabled={loading} className="w-full max-w-md mx-auto lg:max-w-full mt-6 sm:mt-8 flex justify-center items-center bg-teal-600 dark:bg-teal-500 text-white py-2.5 sm:py-3 lg:py-2.5 rounded-md font-semibold text-base sm:text-lg lg:text-base hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50">
            {loading ? "Сохранение..." : <><FiSave className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Сохранить объявление</>}
                            </button>

        </form>
      </div>
    </div>
  );
};

export default EditAd;
