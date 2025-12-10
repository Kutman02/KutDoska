// src/components/DashboardTabs/ProfileSettings.jsx

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiUser, FiSettings, FiCamera } from "react-icons/fi";

const ProfileSettings = ({ user }) => {
    const [name, setName] = useState(user?.name || "");
    const [email] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [about, setAbout] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [previewImage, setPreviewImage] = useState(user?.profileImageUrl || "https://via.placeholder.com/150?text=Profile");
    const [loading, setLoading] = useState(false);

    // Загрузка сохранённых настроек профиля
    useEffect(() => {
        const fetchProfileSettings = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch("http://localhost:8080/api/auth/profile/settings", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Не удалось загрузить профиль");

                const data = await res.json();
                setName(data.displayName || user?.name || "");
                setPhone(data.phone || user?.phone || "");
                setAbout(data.about || "");
                setProfileImageUrl(data.profileImageUrl || "");
                if (data.profileImageUrl) setPreviewImage(data.profileImageUrl);
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
                toast.error("Не удалось загрузить профиль");
            }
        };

        fetchProfileSettings();
    }, [user]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreviewImage(URL.createObjectURL(file));
            uploadImage(file);
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8080/api/upload/ad-image", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Не удалось загрузить фото");
            const data = await res.json();
            setProfileImageUrl(data.imageUrl);
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Не авторизован");
                return;
            }

            const res = await fetch("http://localhost:8080/api/auth/profile/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    displayName: name,
                    phone,
                    about,
                    profileImageUrl,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Не удалось сохранить профиль");
            }

            toast.success("Профиль обновлен");
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl shadow-gray-300/50 my-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 border-b pb-4">
                <FiUser className="w-6 h-6 text-teal-600" /> 
                Редактирование Профиля
            </h2>
            <form onSubmit={handleSave}>
                
                {/* Загрузка Фото Профиля */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 mb-4">
                        <img 
                            src={previewImage} 
                            alt="Профиль" 
                            className="w-full h-full object-cover rounded-full ring-4 ring-teal-500/50 shadow-lg"
                        />
                        <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-2 bg-teал-500 text-white rounded-full cursor-pointer hover:bg-teal-600 transition shadow-lg shadow-teal-400/50">
                            <FiCamera className="w-5 h-5" />
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">Нажмите, чтобы изменить фото</p>
                </div>

                {/* Поля Данных */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                        <input
                            type="text"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 transition duration-200 bg-gray-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email изменить нельзя.</p>
                    </div>
                    <div>
                        <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                        <textarea
                            id="about"
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-inner focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                            placeholder="Кратко опишите себя или ваш бизнес"
                        />
                    </div>
                </div>

                {/* Кнопка Сохранить */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold 
                               shadow-lg shadow-teал-400/50 hover:bg-teal-700 transition transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                    <FiSettings className="w-5 h-5" /> {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;