// src/pages/Dashboard.jsx (Обновленный файл)

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { FiGrid, FiUser, FiList } from "react-icons/fi";
import { useAppSelector } from "../store/hooks";
import Breadcrumb from "../components/Breadcrumb";

// 💡 Импортируем разделенные компоненты
import MyAds from "../components/DashboardTabs/MyAds";
import ProfileSettings from "../components/DashboardTabs/ProfileSettings";
import AdminCategories from "../components/DashboardTabs/AdminCategories"; // Админ-панель

const Dashboard = () => {
  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState('ads'); 
  
  // Получаем данные пользователя из RTK
  const { user } = useAppSelector((state) => state.auth); 
  
  // При монтировании, если пользователь - админ, по умолчанию ставим вкладку категорий.
  // Закомментировано, чтобы пользователь всегда видел свои объявления по умолчанию:
  /*
  useEffect(() => {
    if (user && user.role === "admin") {
      setActiveTab('categories');
    }
  }, [user]);
  */

  const TabButton = ({ tabName, icon: Icon, label }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all duration-300
                    ${isActive 
                      ? "bg-white text-teal-600 shadow-md shadow-gray-200/50 border-t-2 border-teal-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`
                  }
      >
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }


  // Формируем breadcrumb items в зависимости от активной вкладки
  const getBreadcrumbItems = () => {
    const items = [{ label: "Панель управления", path: "/dashboard" }];
    if (activeTab === "ads") {
      items.push({ label: "Мои объявления", path: "/dashboard?tab=ads" });
    } else if (activeTab === "profile") {
      items.push({ label: "Настройки профиля", path: "/dashboard?tab=profile" });
    } else if (activeTab === "categories") {
      items.push({ label: "Управление категориями", path: "/dashboard?tab=categories" });
    }
    return items;
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 bg-gray-50">
        <div className="max-w-screen-xl mx-auto py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={getBreadcrumbItems()} />
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 hidden md:block">
            Панель Управления {user && user.role === "admin" && "(Администратор)"}
          </h1>
          
          {/* Навигация по вкладкам (Tabs) */}
          <div className="flex border-b border-gray-200 mb-8">
            <TabButton tabName="ads" icon={FiGrid} label="Мои Объявления" />
            <TabButton tabName="profile" icon={FiUser} label="Настройки Профиля" />
            
            {/* 💡 ВКЛАДКА ТОЛЬКО ДЛЯ АДМИНА */}
            {user && user.role === "admin" && (
                <TabButton tabName="categories" icon={FiList} label="Категории (Админ)" />
            )}
          </div>

          {/* Контент вкладок */}
          <div className="w-full">
            {activeTab === 'ads' && <MyAds user={user} />}
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            
            {/* 💡 УСЛОВНЫЙ РЕНДЕРИНГ КОМПОНЕНТА АДМИНА */}
            {activeTab === 'categories' && user && user.role === "admin" && (
                <AdminCategories />
            )}
            
            {/* Защита от прямого URL-доступа к вкладке админа */}
            {activeTab === 'categories' && (!user || user.role !== "admin") && (
                <div className="text-center p-12 bg-white rounded-xl shadow mt-10 text-xl text-red-500">
                    Доступ запрещен. У вас нет прав администратора.
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;