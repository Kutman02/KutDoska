import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiMapPin, FiBriefcase, FiPhone} from "react-icons/fi";
import { TbCircleLetterC } from "react-icons/tb";
import toast from "react-hot-toast";

// Импорт компонентов
import AdEditor from "../components/CreateAd/AdEditor";
import ImageUploader from "../components/CreateAd/ImageUploader";
import Breadcrumb from "../components/Breadcrumb";
import type { Category } from "../types/category.types";
import type { Location } from "../types/location.types";

const CreateAd: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояния
  // ИЗМЕНЕНИЕ: убрали title, оставили только description (теперь называется "Описание")
  const [description, setDescription] = useState(""); 
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  // ИЗМЕНЕНИЕ 2: Устанавливаем дефолтное значение для номера телефона
  const [phone, setPhone] = useState("+996"); 
  const [hidePhone, setHidePhone] = useState(false);
  const [images, setImages] = useState<string[]>([]); 
  const [loading, setLoading] = useState(false);
  
  // Категории
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  // Локации
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [districts, setDistricts] = useState<Location[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  // 1. Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/categories");
            if (!response.ok) throw new Error("Ошибка загрузки");
            const data = await response.json(); 
            setCategories(data);
            // Не выбираем категорию автоматически - пользователь должен выбрать сам
        } catch (error) {
            console.error(error);
            toast.error("Ошибка при загрузке категорий.");
        }
    };
    fetchCategories();
  }, []);

  // Загрузка подкатегорий
  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/categories/${categoryId}/subcategories`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
        setSelectedSubcategoryId(""); // Сбрасываем выбор при смене категории
      }
    } catch (error) {
      console.error(error);
      setSubcategories([]);
    }
  };

  // Загрузка локаций
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/locations");
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchLocations();
  }, []);

  // Загрузка районов при выборе города
  const fetchDistricts = async (cityId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/locations/${cityId}/districts`);
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
        setSelectedDistrictId(""); // Сбрасываем выбор района
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
    setSelectedSubcategoryId(""); // Сбрасываем выбранную подкатегорию при смене категории
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]); // Очищаем список подкатегорий, если категория не выбрана
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

  // 2. Логика загрузки фото
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
  
  // НОВЫЙ ОБРАБОТЧИК ДЛЯ ТЕЛЕФОНА
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prefix = '+996';
    
    // Если пользователь удалил все, кроме префикса, восстанавливаем его
    if (value.length < prefix.length || !value.startsWith(prefix)) {
        setPhone(prefix);
        // Дополнительная проверка, чтобы не сбрасывать ввод, если пользователь пытается ввести цифры
        if (value.length > prefix.length) {
             // Позволяем вводить только цифры после префикса
             const digits = value.replace(prefix, '').replace(/[^0-9]/g, '');
             setPhone(prefix + digits);
        }
    } else {
        setPhone(value);
    }
  };


  // 3. Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка обязательных полей
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

    // Если есть подкатегории, подкатегория обязательна
    if (subcategories.length > 0 && !selectedSubcategoryId) {
      toast.error("Необходимо выбрать подкатегорию");
      return;
    }

    if (!selectedCityId) {
      toast.error("Необходимо выбрать город");
      return;
    }

    if (!phone || phone.trim() === "" || phone === "+996") {
      toast.error("Необходимо указать номер телефона");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Обработка цены: если пусто или 0, отправляем 0 (будет "Договорная")
      const finalPrice = price && parseFloat(price) > 0 ? parseFloat(price) : 0;
      
      const response = await fetch("http://localhost:8080/api/ads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Генерируем title из первых 100 символов описания для совместимости
            title: description.trim().substring(0, 100) || "Объявление",
            content: description,
            price: finalPrice,
            location,
            locationId: selectedDistrictId || selectedCityId,
            phone,
            hidePhone,
            images,
            imageUrl: images[0] || "",
            tags: [], 
            isPublic: true, 
            category: selectedCategoryId,
            subcategory: selectedSubcategoryId || null,
          }),
        }
      );

      if (!response.ok) throw new Error("Ошибка создания");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания объявления';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-2 sm:p-4 md:p-8 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6 md:mb-8 pb-2">
          Новое Объявление
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          
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
                    <input 
                        type="tel" 
                        placeholder="555 00 00 00"
                        value={phone} 
                        onChange={handlePhoneChange}
                        className="w-full bg-transparent outline-none text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500" 
                        required
                    />
                </div>
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
            {loading ? "Публикация..." : <><FiSend className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Опубликовать объявление</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateAd;