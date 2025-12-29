import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
// Импорт иконок
import { FiUser, FiSettings, FiCamera, FiTrash2 } from "react-icons/fi";
import type { User } from "../../types/user.types";

interface ProfileSettingsProps {
  user?: User | null;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
    const PHONE_PREFIX = "+996";
    
    // Извлекаем только цифры из сохраненного номера (если есть)
    const extractPhoneDigits = (phoneStr: string): string => {
        if (!phoneStr) return "";
        // Убираем все нецифровые символы
        const digits = phoneStr.replace(/\D/g, "");
        // Если номер начинается с 996, убираем префикс
        if (digits.startsWith("996") && digits.length > 3) {
            return digits.substring(3);
        }
        return digits;
    };
    
    const [name, setName] = useState(user?.name || "");
    const [email] = useState(user?.email || "");
    const [phoneDigits, setPhoneDigits] = useState(extractPhoneDigits(user?.phone || ""));
    const [phoneError, setPhoneError] = useState("");
    const [website, setWebsite] = useState("");
    const [about, setAbout] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    
    // 💡 ИЗМЕНЕНО: Инициализируем либо URL, либо null для отображения иконки по умолчанию
    const [previewImage, setPreviewImage] = useState(user?.profileImageUrl || null); 
    
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
                setPhoneDigits(extractPhoneDigits(data.phone || user?.phone || ""));
                setWebsite(data.website || "");
                setAbout(data.about || "");
                setProfileImageUrl(data.profileImageUrl || "");
                
                // 💡 ИЗМЕНЕНО: Если URL есть, обновляем previewImage, иначе он останется null (иконка)
                setPreviewImage(data.profileImageUrl || null); 
                
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
                toast.error("Не удалось загрузить профиль");
            }
        };

        fetchProfileSettings();
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreviewImage(URL.createObjectURL(file));
            uploadImage(file);
        }
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            setLoading(true);
            // 💡 ПРИМЕЧАНИЕ: Этот эндпоинт используется для объявления.
            // Убедитесь, что он возвращает правильный URL и подходит для аватаров.
            const res = await fetch("http://localhost:8080/api/upload/ad-image", { 
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Не удалось загрузить фото");
            const data = await res.json();
            setProfileImageUrl(data.imageUrl);
            
            // Сохраняем URL в настройках профиля
            const token = localStorage.getItem("token");
            if (token) {
                await fetch("http://localhost:8080/api/auth/profile/settings", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        displayName: name,
                        phone: phoneDigits ? `${PHONE_PREFIX}${phoneDigits}` : "",
                        website,
                        about,
                        profileImageUrl: data.imageUrl,
                    }),
                });
                
                // Уведомляем другие компоненты об обновлении профиля
                window.dispatchEvent(new Event('profileUpdated'));
            }
        } catch (err) {
            console.error(err);
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!previewImage) return;
        
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Не авторизован");
                return;
            }

            // Удаляем фото, устанавливая profileImageUrl в пустую строку
            const res = await fetch("http://localhost:8080/api/auth/profile/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    displayName: name,
                    phone: phoneDigits ? `${PHONE_PREFIX}${phoneDigits}` : "",
                    website,
                    about,
                    profileImageUrl: "", // Удаляем фото
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Не удалось удалить фото");
            }

            // Обновляем локальное состояние
            setProfileImageUrl("");
            setPreviewImage(null);
            
            // Уведомляем другие компоненты об обновлении профиля
            window.dispatchEvent(new Event('profileUpdated'));
            
            toast.success("Фото профиля удалено");
        } catch (err) {
            console.error(err);
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Только цифры
        // Ограничиваем до 9 цифр
        if (value.length <= 9) {
            setPhoneDigits(value);
            setPhoneError("");
        } else {
            setPhoneError("Номер должен содержать ровно 9 цифр");
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Валидация телефона
        if (phoneDigits && phoneDigits.length !== 9) {
            setPhoneError("Номер должен содержать ровно 9 цифр");
            toast.error("Номер телефона должен содержать ровно 9 цифр");
            return;
        }
        
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
                    phone: phoneDigits ? `${PHONE_PREFIX}${phoneDigits}` : "",
                    website,
                    about,
                    profileImageUrl, // Отправляем новый или существующий URL
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Не удалось сохранить профиль");
            }

            // Уведомляем другие компоненты об обновлении профиля
            window.dispatchEvent(new Event('profileUpdated'));
            
            toast.success("Профиль обновлен");
        } catch (err) {
            console.error(err);
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 sm:p-6 md:p-8 bg-white dark:bg-slate-800 rounded-md my-4 sm:my-6 md:my-10 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6 sm:mb-8 flex items-center gap-2 border-b border-gray-200 dark:border-slate-700 pb-3 sm:pb-4">
                <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" /> 
                Редактирование Профиля
            </h2>
            
            <form onSubmit={handleSave}>
                
                {/* Загрузка Фото Профиля */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 mb-4">
                        
                        {/* 💡 ИЗМЕНЕНИЕ: УСЛОВНЫЙ РЕНДЕРИНГ ДЛЯ ИКОНКИ ПО УМОЛЧАНИЮ */}
                        {previewImage ? (
                            <img 
                                src={previewImage} 
                                alt="Профиль" 
                                className="w-full h-full object-cover rounded-full shadow-lg"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-full shadow-lg bg-linear-to-br from-teal-400 to-teal-600">
                                <FiUser className="w-16 h-16 text-white" />
                            </div>
                        )}

                        <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-2 bg-teal-600 text-white rounded-full cursor-pointer hover:bg-teal-700 transition shadow-lg shadow-teal-400/50 z-10">
                            <FiCamera className="w-5 h-5" />
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>

                        {/* Кнопка удаления фото - показывается только если есть фото */}
                        {previewImage && (
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                disabled={loading}
                                className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-600 transition shadow-lg shadow-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                title="Удалить фото"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        {previewImage ? "Нажмите на камеру, чтобы изменить фото" : "Нажмите на камеру, чтобы загрузить фото"}
                    </p>
                </div>

                {/* Поля Данных */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Имя</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Телефон</label>
                        <div className="flex items-center">
                            <span className="px-4 py-3 border border-r-0 border-gray-200 dark:border-slate-600 rounded-l-md bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-medium">
                                {PHONE_PREFIX}
                            </span>
                            <input
                                type="tel"
                                id="phone"
                                value={phoneDigits}
                                onChange={handlePhoneChange}
                                placeholder="703601025"
                                maxLength={9}
                                className={`flex-1 px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-r-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                                    phoneError ? "border-red-500 dark:border-red-500" : ""
                                }`}
                            />
                        </div>
                        {phoneError && (
                            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{phoneError}</p>
                        )}
                        {!phoneError && phoneDigits && phoneDigits.length !== 9 && phoneDigits.length > 0 && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                Введите 9 цифр (осталось {9 - phoneDigits.length})
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Веб-сайт</label>
                        <input
                            type="url"
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Ваш веб-сайт будет отображаться в публичном профиле вместо email</p>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Email изменить нельзя. Он не отображается в публичном профиле.</p>
                    </div>
                    <div>
                        <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">О себе</label>
                        <textarea
                            id="about"
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            placeholder="Кратко опишите себя или ваш бизнес"
                        />
                    </div>
                </div>

                {/* Кнопка Сохранить */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 sm:mt-8 w-full flex items-center justify-center gap-2 bg-teal-600 dark:bg-teal-500 text-white px-6 py-3 rounded-md font-semibold 
                               hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-60 touch-manipulation active:scale-95"
                >
                    <FiSettings className="w-5 h-5" /> {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;