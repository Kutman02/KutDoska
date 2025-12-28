// src/components/DashboardTabs/AdminCategories.jsx

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiLayers, FiPlus, FiMapPin, FiTrash2, FiEdit } from "react-icons/fi";

const AdminCategories = () => {
    const [activeTab, setActiveTab] = useState("categories"); // "categories" или "locations"
    
    // Состояния для категорий
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [parent, setParent] = useState("");
    const [loading, setLoading] = useState(false);
    const [mainCategories, setMainCategories] = useState([]);
    
    // Состояния для локаций
    const [locationName, setLocationName] = useState("");
    const [locationType, setLocationType] = useState("city");
    const [locationParent, setLocationParent] = useState("");
    const [cities, setCities] = useState([]);
    const [locations, setLocations] = useState([]); 
    
    // Загрузка существующих категорий
    const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/categories"); 
            if (res.ok) {
                const data = await res.json();
                setMainCategories(data);
            }
        } catch (error) {
            console.error("Не удалось загрузить главные категории:", error);
            toast.error("Не удалось загрузить список родительских категорий.");
        }
    };

    // Загрузка локаций
    const fetchLocations = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/locations");
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
                setCities(data); // Города - это все локации типа city
            }
        } catch (error) {
            console.error("Не удалось загрузить локации:", error);
            toast.error("Не удалось загрузить локации.");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchLocations();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!name.trim()) {
            toast.error("Имя категории обязательно.");
            setLoading(false);
            return;
        }
        
        // icon нужен, только если родитель не выбран (это Главная категория)
        if (!parent && !icon.trim()) {
             toast.error("Для главной категории необходима иконка.");
             setLoading(false);
             return;
        }
        
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/categories/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, icon, parent: parent || null }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Не удалось создать категорию.");
            }

            toast.success(`Категория "${name}" успешно создана!`);
            
            // Сброс полей и обновление списка категорий
            setName("");
            setIcon("");
            setParent("");
            fetchCategories(); // Перезагружаем список родителей
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Обработчик создания локации
    const handleCreateLocation = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!locationName.trim()) {
            toast.error("Имя локации обязательно.");
            setLoading(false);
            return;
        }

        if (locationType === "district" && !locationParent) {
            toast.error("Для района необходимо выбрать город.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/locations/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: locationName,
                    type: locationType,
                    parent: locationType === "district" ? locationParent : null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Не удалось создать локацию.");
            }

            toast.success(`Локация "${locationName}" успешно создана!`);
            setLocationName("");
            setLocationType("city");
            setLocationParent("");
            fetchLocations();
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Обработчик удаления локации
    const handleDeleteLocation = async (id, name) => {
        if (!window.confirm(`Вы уверены, что хотите удалить локацию "${name}"?`)) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/locations/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Не удалось удалить локацию.");
            }

            toast.success("Локация успешно удалена!");
            fetchLocations();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-2xl shadow-gray-300/50 my-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                <FiLayers className="w-6 h-6 text-teal-600" /> 
                Админ Панель
            </h2>

            {/* Табы */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 ${
                        activeTab === "categories"
                            ? "border-b-4 border-teal-500 text-teal-600"
                            : "text-gray-600 hover:text-teal-600"
                    }`}
                >
                    <FiLayers className="inline mr-2" />
                    Категории
                </button>
                <button
                    onClick={() => setActiveTab("locations")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 ${
                        activeTab === "locations"
                            ? "border-b-4 border-teal-500 text-teal-600"
                            : "text-gray-600 hover:text-teal-600"
                    }`}
                >
                    <FiMapPin className="inline mr-2" />
                    Города и Районы
                </button>
            </div>

            {/* Контент табов */}
            {activeTab === "categories" && (
                <form onSubmit={handleCreate} className="space-y-6">
                
                {/* Имя Категории */}
                <div>
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">Имя Категории</label>
                    <input
                        type="text"
                        id="category-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-red-500 focus:border-red-500 transition duration-200"
                        placeholder="Например: 'Квартиры' или 'Транспорт'"
                        required
                    />
                </div>

                {/* Выбор Родителя */}
                <div>
                    <label htmlFor="parent-category" className="block text-sm font-medium text-gray-700 mb-1">
                        Родительская категория (для Подкатегорий)
                    </label>
                    <select
                        id="parent-category"
                        value={parent}
                        onChange={(e) => setParent(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-red-500 focus:border-red-500 transition duration-200 bg-white"
                    >
                        <option value="">-- Главная Категория (Нет Родителя) --</option>
                        {mainCategories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                
                {/* Иконка (Только для Главных Категорий) */}
                <div>
                    <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700 mb-1">Иконка (Только для Главных категорий)</label>
                    <input
                        type="text"
                        id="category-icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-red-500 focus:border-red-500 transition duration-200"
                        placeholder="Имя иконки Feather (напр., Home, Car, Monitor)"
                        disabled={!!parent}
                    />
                </div>

                    {/* Кнопка Сохранить */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold 
                                   shadow-lg shadow-teal-400/50 hover:bg-teal-700 transition transform hover:-translate-y-0.5 disabled:bg-gray-400"
                    >
                        <FiPlus className="w-5 h-5" /> 
                        {loading ? "Создание..." : "Создать Категорию"}
                    </button>
                </form>
            )}

            {activeTab === "locations" && (
                <div className="space-y-6">
                    <form onSubmit={handleCreateLocation} className="space-y-6 p-6 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Создать новую локацию</h3>
                        
                        {/* Тип локации */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Тип локации</label>
                            <select
                                value={locationType}
                                onChange={(e) => {
                                    setLocationType(e.target.value);
                                    if (e.target.value === "city") setLocationParent("");
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                            >
                                <option value="city">Город</option>
                                <option value="district">Район</option>
                            </select>
                        </div>

                        {/* Имя локации */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Имя {locationType === "city" ? "города" : "района"}</label>
                            <input
                                type="text"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                                placeholder={locationType === "city" ? "Например: Бишкек" : "Например: Центр"}
                                required
                            />
                        </div>

                        {/* Родительский город (только для районов) */}
                        {locationType === "district" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                                <select
                                    value={locationParent}
                                    onChange={(e) => setLocationParent(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                                    required
                                >
                                    <option value="">Выберите город</option>
                                    {cities.map(city => (
                                        <option key={city._id} value={city._id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold 
                                       shadow-lg shadow-teal-400/50 hover:bg-teal-700 transition transform hover:-translate-y-0.5 disabled:bg-gray-400"
                        >
                            <FiPlus className="w-5 h-5" />
                            {loading ? "Создание..." : `Создать ${locationType === "city" ? "Город" : "Район"}`}
                        </button>
                    </form>

                    {/* Список локаций */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Существующие локации</h3>
                        <div className="space-y-4">
                            {locations.map(city => (
                                <div key={city._id} className="p-4 border border-gray-200 rounded-xl bg-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <FiMapPin className="text-teal-600" />
                                            <span className="font-semibold text-gray-800">{city.name}</span>
                                            <span className="text-xs text-gray-500">(Город)</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteLocation(city._id, city.name)}
                                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                    {city.districts && city.districts.length > 0 && (
                                        <div className="ml-6 mt-2 space-y-2">
                                            {city.districts.map(district => (
                                                <div key={district._id} className="flex items-center justify-between text-sm text-gray-600">
                                                    <span>• {district.name}</span>
                                                    <button
                                                        onClick={() => handleDeleteLocation(district._id, district.name)}
                                                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {locations.length === 0 && (
                                <p className="text-gray-500 text-center py-8">Локации пока не добавлены</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;