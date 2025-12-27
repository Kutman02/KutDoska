import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiMapPin, FiBriefcase, FiPhone} from "react-icons/fi";
import { TbCircleLetterC } from "react-icons/tb";
import toast from "react-hot-toast";

// Импорт компонентов
import AdEditor from "../components/CreateAd/AdEditor";
import ImageUploader from "../components/CreateAd/ImageUploader";
import Breadcrumb from "../components/Breadcrumb";

const CreateAd = () => {
  const navigate = useNavigate();
  
  // Состояния
  // ИЗМЕНЕНИЕ: убрали title, оставили только description (теперь называется "Описание")
  const [description, setDescription] = useState(""); 
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  // ИЗМЕНЕНИЕ 2: Устанавливаем дефолтное значение для номера телефона
  const [phone, setPhone] = useState("+996"); 
  const [hidePhone, setHidePhone] = useState(false);
  const [images, setImages] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Категории
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

  // Локации
  const [locations, setLocations] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [districts, setDistricts] = useState([]);
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
  const fetchSubcategories = async (categoryId) => {
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
  const fetchDistricts = async (cityId) => {
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
  const handleCategoryChange = (e) => {
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
  const handleCityChange = (e) => {
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
  const handleImageUpload = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const filesToUpload = Array.from(selectedFiles).slice(0, 5 - images.length);
    
    if (filesToUpload.length === 0) {
      toast.error("Максимум 5 изображений");
      return;
    }

    try {
      setLoading(true);
      const uploadPromises = filesToUpload.map(async (file) => {
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
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  // НОВЫЙ ОБРАБОТЧИК ДЛЯ ТЕЛЕФОНА
  const handlePhoneChange = (e) => {
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
  const handleSubmit = async (e) => {
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
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 pb-2">
          Новое Объявление
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8 bg-white rounded-3xl shadow-xl">
          
          {/* 1. ФОТОГРАФИИ */}
          <div className="w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Фотографии <span className="text-red-500">*</span>
            </label>
            <ImageUploader 
                images={images} 
                onUpload={handleImageUpload} 
                onRemove={handleRemoveImage} 
            />
          </div>

          <hr className="border-gray-100" />

          {/* 2. ОПИСАНИЕ */}
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
               Описание <span className="text-red-500">*</span>
             </label>
             <AdEditor content={description} onChange={setDescription} />
          </div>

          {/* 3. КАТЕГОРИЯ И ПОДКАТЕГОРИЯ */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Категория <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <FiBriefcase className="w-5 h-5 text-teal-500" />
                  <select
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="w-full bg-transparent outline-none cursor-pointer text-gray-700"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
              </div>
            </div>

            {/* Подкатегория показывается сразу после выбора категории */}
            {selectedCategoryId && subcategories.length > 0 && (
              <div className="transition-all duration-300 ease-in-out">
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Подкатегория <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <FiBriefcase className="w-5 h-5 text-teal-500" />
                    <select
                      value={selectedSubcategoryId}
                      onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-gray-700"
                      required
                    >
                      <option value="">Выберите подкатегорию</option>
                      {subcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                    </select>
                </div>
              </div>
            )}

            {/* Сообщение, если у категории нет подкатегорий */}
            {selectedCategoryId && subcategories.length === 0 && (
              <div className="text-sm text-gray-500 italic ml-1">
                У этой категории нет подкатегорий. Можно продолжить без выбора подкатегории.
              </div>
            )}
          </div>

          {/* 4. ГОРОД / РАЙОН */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Город <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <FiMapPin className="w-5 h-5 text-teal-500" />
                  <select
                    value={selectedCityId}
                    onChange={handleCityChange}
                    className="w-full bg-transparent outline-none cursor-pointer text-gray-700"
                    required
                  >
                    <option value="">Выберите город</option>
                    {locations.map(city => <option key={city._id} value={city._id}>{city.name}</option>)}
                  </select>
              </div>
            </div>

            {/* Район (если выбран город с районами) */}
            {districts.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Район (необязательно)
                </label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <FiMapPin className="w-5 h-5 text-teal-500" />
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      className="w-full bg-transparent outline-none cursor-pointer text-gray-700"
                    >
                      <option value="">Не выбрано</option>
                      {districts.map(district => <option key={district._id} value={district._id}>{district.name}</option>)}
                    </select>
                </div>
              </div>
            )}

            {/* Дополнительное текстовое поле для локации */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                  Дополнительная информация о местоположении (необязательно)
              </label>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <FiMapPin className="w-5 h-5 text-teal-500" />
                  <input 
                      type="text" 
                      placeholder="Например: ул. Чуй, д. 123" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)} 
                      className="w-full bg-transparent outline-none" 
                  />
              </div>
            </div>
          </div>

          {/* 5. ЦЕНА */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Цена (сом)
            </label>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <TbCircleLetterC className="w-5 h-5 text-teal-500" />
                <input 
                    type="number" 
                    placeholder="Договорная" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="w-full bg-transparent outline-none font-medium" 
                    min="0"
                />
            </div>
            {/* <p className="text-xs text-gray-500 mt-1 ml-1">Если не указано или 0, будет отображаться "Договорная"</p> */}
          </div>

          {/* 6. НОМЕР ТЕЛЕФОНА */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Номер телефона <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <FiPhone className="w-5 h-5 text-teal-500" />
                <input 
                    type="tel" 
                    placeholder="555 00 00 00"
                    value={phone} 
                    onChange={handlePhoneChange}
                    className="w-full bg-transparent outline-none" 
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

          {/* Кнопка отправки */}
          <button type="submit" disabled={loading} className="w-full mt-8 flex justify-center items-center bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-700 transition shadow-lg shadow-teal-200">
            {loading ? "Публикация..." : <><FiSend className="mr-2" /> Опубликовать объявление</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateAd;