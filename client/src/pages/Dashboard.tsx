// src/pages/Dashboard.tsx (Обновленный файл)

import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { FiGrid, FiUser, FiList } from "react-icons/fi";
import { useAppSelector } from "../store/hooks";
import Breadcrumb from "../components/Breadcrumb";
import type { ComponentType } from "react";
import type { BreadcrumbItem } from "../types/component.types";

// 💡 Импортируем разделенные компоненты
import MyAds from "../components/DashboardTabs/MyAds";
import ProfileSettings from "../components/DashboardTabs/ProfileSettings";
import AdminCategories from "../components/DashboardTabs/AdminCategories"; // Админ-панель

type TabName = 'ads' | 'profile' | 'categories';

interface TabButtonProps {
  tabName: TabName;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get('tab') || 'ads') as TabName;
  
  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState<TabName>(tabFromUrl); 
  
  // Получаем данные пользователя из RTK
  const { user } = useAppSelector((state) => state.auth);

  // Синхронизация вкладки с URL параметром
  useEffect(() => {
    const tab = (searchParams.get('tab') || 'ads') as TabName;
    if (['ads', 'profile', 'categories'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]); 
  
  // При монтировании, если пользователь - админ, по умолчанию ставим вкладку категорий.
  // Закомментировано, чтобы пользователь всегда видел свои объявления по умолчанию:
  /*
  useEffect(() => {
    if (user && user.role === "admin") {
      setActiveTab('categories');
    }
  }, [user]);
  */

  const TabButton: React.FC<TabButtonProps> = ({ tabName, icon: Icon, label }) => {
    const isActive = activeTab === tabName;
    const handleClick = () => {
      setActiveTab(tabName);
      setSearchParams({ tab: tabName });
    };
    
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all duration-200
                    ${isActive 
                      ? "text-teal-600 border-b-4 border-teal-500 bg-teal-50/50"
                      : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                    }`
                  }
      >
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }


  // Формируем breadcrumb items в зависимости от активной вкладки
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Панель управления", path: "/dashboard" }];
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
      {/* Цветной фон для отличия от главной страницы */}
      <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="w-full p-4 sm:p-6 lg:p-8">
          {/* Карточка контента с белым фоном и тенью */}
          <div className="bg-white rounded-2xl shadow-xl shadow-teal-100/50 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
            <div className="w-full py-4">
              {/* Breadcrumb */}
              <Breadcrumb items={getBreadcrumbItems()} showHomeIcon={true} />
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 mt-4">
                Панель Управления {user && user.role === "admin" && <span className="text-teal-600">(Администратор)</span>}
              </h1>
              
              {/* Навигация по вкладкам (Tabs) */}
              <div className="flex border-b-2 border-gray-200 mb-8 overflow-x-auto bg-gray-50 rounded-t-lg -mx-2 px-2">
                <TabButton tabName="ads" icon={FiGrid} label="Мои Объявления" />
                <TabButton tabName="profile" icon={FiUser} label="Настройки Профиля" />
                
                {/* 💡 ВКЛАДКА ТОЛЬКО ДЛЯ АДМИНА */}
                {user && user.role === "admin" && (
                    <TabButton tabName="categories" icon={FiList} label="Категории (Админ)" />
                )}
              </div>

              {/* Контент вкладок */}
              <div className="w-full">
                {activeTab === 'ads' && <MyAds />}
                {activeTab === 'profile' && <ProfileSettings user={user || undefined} />}
                
                {/* 💡 УСЛОВНЫЙ РЕНДЕРИНГ КОМПОНЕНТА АДМИНА */}
                {activeTab === 'categories' && user && user.role === "admin" && (
                    <AdminCategories />
                )}
                
                {/* Защита от прямого URL-доступа к вкладке админа */}
                {activeTab === 'categories' && (!user || user.role !== "admin") && (
                    <div className="text-center p-12 mt-10 text-xl text-red-500">
                        Доступ запрещен. У вас нет прав администратора.
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;