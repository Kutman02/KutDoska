// src/components/DashboardTabs/AdminCategories.jsx

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiLayers, FiPlus } from "react-icons/fi";

const AdminCategories = () => {
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [parent, setParent] = useState("");
    const [loading, setLoading] = useState(false);
    const [mainCategories, setMainCategories] = useState([]); 
    
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

    useEffect(() => {
        fetchCategories();
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

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-2xl shadow-gray-300/50 my-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 border-b pb-4">
                <FiLayers className="w-6 h-6 text-red-600" /> 
                Управление Категориями (Админ)
            </h2>
            
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
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold 
                               shadow-lg shadow-red-400/50 hover:bg-red-700 transition transform hover:-translate-y-0.5 disabled:bg-gray-400"
                >
                    <FiPlus className="w-5 h-5" /> 
                    {loading ? "Создание..." : "Создать Категорию"}
                </button>
            </form>
        </div>
    );
};

export default AdminCategories;