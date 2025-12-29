// src/components/DashboardTabs/AdminCategories.tsx

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiLayers, FiPlus, FiMapPin, FiTrash2, FiUsers } from "react-icons/fi";
import ConfirmModal from "../ConfirmModal";
import IconPicker from "../IconPicker";
import { useAppSelector } from "../../store/hooks";
import type { Category } from "../../types/category.types";
import type { Location, LocationType } from "../../types/location.types";
import type { User } from "../../types/user.types";

type TabName = "categories" | "locations" | "users";

interface DeleteConfirmState {
    isOpen: boolean;
    type: "category" | "location" | "user" | null;
    id: string;
    name: string;
}

const AdminCategories: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>("categories");
    
    // Получаем текущего пользователя из Redux store
    const currentUser = useAppSelector((state) => state.auth.user);
    
    // Состояния для категорий
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [parent, setParent] = useState("");
    const [loading, setLoading] = useState(false);
    const [mainCategories, setMainCategories] = useState<Category[]>([]);
    
    // Состояния для локаций
    const [locationName, setLocationName] = useState("");
    const [locationType, setLocationType] = useState<LocationType>("city");
    const [locationParent, setLocationParent] = useState("");
    const [cities, setCities] = useState<Location[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    
    // Состояния для пользователей
    const [users, setUsers] = useState<User[]>([]);
    
    // Состояние для модального окна подтверждения удаления
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
        isOpen: false,
        type: null,
        id: "",
        name: "",
    }); 
    
    // Загрузка существующих категорий
    const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/categories"); 
            if (res.ok) {
                const data = await res.json();
                setMainCategories(data);
            } else {
                console.error("Ошибка загрузки категорий:", res.status);
            }
        } catch (error) {
            // Не показываем ошибку, если сервер просто не запущен
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.warn("Сервер недоступен. Убедитесь, что сервер запущен на порту 8080.");
            } else {
                console.error("Не удалось загрузить главные категории:", error);
            }
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
            } else {
                console.error("Ошибка загрузки локаций:", res.status);
            }
        } catch (error) {
            // Не показываем ошибку, если сервер просто не запущен
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.warn("Сервер недоступен. Убедитесь, что сервер запущен на порту 8080.");
            } else {
                console.error("Не удалось загрузить локации:", error);
            }
        }
    };

    // Загрузка пользователей
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/auth/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                if (res.status === 401 || res.status === 403) {
                    toast.error("У вас нет прав для просмотра списка пользователей.");
                } else {
                    console.error("Ошибка загрузки пользователей:", res.status);
                }
            }
        } catch (error) {
            // Не показываем ошибку, если сервер просто не запущен
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.warn("Сервер недоступен. Убедитесь, что сервер запущен на порту 8080.");
            } else {
                console.error("Не удалось загрузить пользователей:", error);
            }
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchLocations();
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
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
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Обработчик создания локации
    const handleCreateLocation = async (e: React.FormEvent) => {
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
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Открытие модального окна для удаления категории
    const openDeleteCategoryModal = (id: string, name: string) => {
        setDeleteConfirm({
            isOpen: true,
            type: "category",
            id,
            name,
        });
    };

    // Открытие модального окна для удаления локации
    const openDeleteLocationModal = (id: string, name: string) => {
        setDeleteConfirm({
            isOpen: true,
            type: "location",
            id,
            name,
        });
    };

    // Открытие модального окна для удаления пользователя
    const openDeleteUserModal = (id: string, name: string) => {
        setDeleteConfirm({
            isOpen: true,
            type: "user",
            id,
            name,
        });
    };

    // Обработчик подтверждения удаления
    const handleConfirmDelete = async () => {
        const { type, id, name } = deleteConfirm;
        
        try {
            const token = localStorage.getItem("token");
            let endpoint = "";
            
            if (type === "category") {
                endpoint = `http://localhost:8080/api/categories/${id}`;
            } else if (type === "location") {
                endpoint = `http://localhost:8080/api/locations/${id}`;
            } else if (type === "user") {
                endpoint = `http://localhost:8080/api/auth/users/${id}`;
            }
            
            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const typeName = type === "category" ? "категорию" : type === "location" ? "локацию" : "пользователя";
                throw new Error(errorData.message || `Не удалось удалить ${typeName}.`);
            }

            const successMessage = type === "category" ? "Категория" : type === "location" ? "Локация" : "Пользователь";
            toast.success(`${successMessage} успешно удален${type === "user" ? "" : "а"}!`);
            
            if (type === "category") {
                fetchCategories();
            } else if (type === "location") {
                fetchLocations();
            } else if (type === "user") {
                fetchUsers();
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
            toast.error(errorMessage);
        } finally {
            setDeleteConfirm({ isOpen: false, type: null, id: "", name: "" });
        }
    };

    return (
        <>
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, type: null, id: "", name: "" })}
                onConfirm={handleConfirmDelete}
                title={
                    deleteConfirm.type === "category" 
                        ? "Удалить категорию?" 
                        : deleteConfirm.type === "location"
                        ? "Удалить локацию?"
                        : "Удалить пользователя?"
                }
                message={`Вы уверены, что хотите удалить ${
                    deleteConfirm.type === "category" 
                        ? "категорию" 
                        : deleteConfirm.type === "location"
                        ? "локацию"
                        : "пользователя"
                } "${deleteConfirm.name}"? Это действие необратимо.`}
                confirmText="Удалить"
                cancelText="Отмена"
            />
            <div className="w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 border-b pb-3 sm:pb-4">
                <FiLayers className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" /> 
                Админ Панель
            </h2>

            {/* Табы */}
            <div className="flex border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
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
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 ${
                        activeTab === "users"
                            ? "border-b-4 border-teal-500 text-teal-600"
                            : "text-gray-600 hover:text-teal-600"
                    }`}
                >
                    <FiUsers className="inline mr-2" />
                    Пользователи
                </button>
            </div>

            {/* Контент табов */}
            {activeTab === "categories" && (
                <div className="space-y-4 sm:space-y-6">
                    <form onSubmit={handleCreate} className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Создать новую категорию</h3>
                        
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
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setParent(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-red-500 focus:border-red-500 transition duration-200 bg-white"
                            >
                                <option value="">-- Главная Категория (Нет Родителя) --</option>
                                {mainCategories.map((cat: Category) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Иконка (Только для Главных Категорий) */}
                        <div>
                            <label htmlFor="category-icon" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Иконка (Только для Главных категорий)</label>
                            <IconPicker
                                selectedIcon={icon}
                                onIconSelect={setIcon}
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

                    {/* Список категорий */}
                    <div className="mt-4 sm:mt-6 lg:mt-8">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Существующие категории</h3>
                        <div className="space-y-4">
                            {mainCategories.map((category: Category) => {
                                const subcategories = category.subcategories && Array.isArray(category.subcategories) 
                                    ? (category.subcategories as Category[])
                                    : [];
                                return (
                                    <div key={category._id} className="p-4 border border-gray-200 rounded-xl bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <FiLayers className="text-teal-600" />
                                                <span className="font-semibold text-gray-800">{category.name}</span>
                                                <span className="text-xs text-gray-500">(Главная категория)</span>
                                            </div>
                                            <button
                                                onClick={() => openDeleteCategoryModal(category._id, category.name)}
                                                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        {subcategories.length > 0 && (
                                            <div className="ml-6 mt-2 space-y-2">
                                                {subcategories.map((subcategory: Category) => (
                                                    <div key={subcategory._id} className="flex items-center justify-between text-sm text-gray-600">
                                                        <span>• {subcategory.name}</span>
                                                        <button
                                                            onClick={() => openDeleteCategoryModal(subcategory._id, subcategory.name)}
                                                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {mainCategories.length === 0 && (
                                <p className="text-gray-500 text-center py-8">Категории пока не добавлены</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "locations" && (
                <div className="space-y-4 sm:space-y-6">
                    <form onSubmit={handleCreateLocation} className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Создать новую локацию</h3>
                        
                        {/* Тип локации */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Тип локации</label>
                            <select
                                value={locationType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setLocationType(e.target.value as LocationType);
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
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLocationParent(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
                                    required
                                >
                                    <option value="">Выберите город</option>
                                    {cities.map((city: Location) => (
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
                    <div className="mt-4 sm:mt-6 lg:mt-8">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Существующие локации</h3>
                        <div className="space-y-4">
                            {locations.map((city: Location) => {
                                const districts = city.districts && Array.isArray(city.districts) 
                                    ? (city.districts as Location[])
                                    : [];
                                return (
                                    <div key={city._id} className="p-4 border border-gray-200 rounded-xl bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <FiMapPin className="text-teal-600" />
                                                <span className="font-semibold text-gray-800">{city.name}</span>
                                                <span className="text-xs text-gray-500">(Город)</span>
                                            </div>
                                            <button
                                                onClick={() => openDeleteLocationModal(city._id, city.name)}
                                                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        {districts.length > 0 && (
                                            <div className="ml-6 mt-2 space-y-2">
                                                {districts.map((district: Location) => (
                                                    <div key={district._id} className="flex items-center justify-between text-sm text-gray-600">
                                                        <span>• {district.name}</span>
                                                        <button
                                                            onClick={() => openDeleteLocationModal(district._id, district.name)}
                                                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {locations.length === 0 && (
                                <p className="text-gray-500 text-center py-8">Локации пока не добавлены</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "users" && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="mt-4 sm:mt-6 lg:mt-8">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Список пользователей</h3>
                        <div className="space-y-4">
                            {users.map((user: User) => {
                                const userRole = user.role === "admin" ? "Администратор" : "Пользователь";
                                const createdAt = user.createdAt 
                                    ? new Date(user.createdAt).toLocaleDateString('ru-RU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })
                                    : "Не указано";
                                
                                // Проверяем, можно ли удалить пользователя
                                const isCurrentUser = currentUser?._id === user._id;
                                const isAdmin = user.role === "admin";
                                const canDelete = !isCurrentUser && !isAdmin;
                                
                                return (
                                    <div key={user._id} className="p-4 border border-gray-200 rounded-xl bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FiUsers className="text-teal-600" />
                                                    <span className="font-semibold text-gray-800">{user.name}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        user.role === "admin" 
                                                            ? "bg-red-100 text-red-700" 
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}>
                                                        {userRole}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                            Вы
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 ml-6 space-y-1">
                                                    <p><span className="font-medium">Email:</span> {user.email}</p>
                                                    {user.phone && (
                                                        <p><span className="font-medium">Телефон:</span> {user.phone}</p>
                                                    )}
                                                    <p><span className="font-medium">Дата регистрации:</span> {createdAt}</p>
                                                </div>
                                            </div>
                                            {canDelete ? (
                                                <button
                                                    onClick={() => openDeleteUserModal(user._id, user.name)}
                                                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition ml-4"
                                                    title="Удалить пользователя"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            ) : (
                                                <div className="ml-4 text-xs text-gray-400 italic">
                                                    {isCurrentUser 
                                                        ? "Нельзя удалить себя" 
                                                        : isAdmin 
                                                        ? "Нельзя удалить админа" 
                                                        : ""}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {users.length === 0 && (
                                <p className="text-gray-500 text-center py-8">Пользователи не найдены</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default AdminCategories;