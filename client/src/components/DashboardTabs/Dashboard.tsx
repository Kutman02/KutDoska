// src/components/DashboardTabs/Dashboard.tsx

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { FiGrid, FiUser, FiList } from "react-icons/fi";
import { useAppSelector } from "../../store/hooks";
import type { ComponentType } from "react";

// 💡 Импортируем разделенные компоненты
import MyAds from "./MyAds";
import ProfileSettings from "./ProfileSettings";
import AdminCategories from "./AdminCategories"; // Админ-панель

type TabName = 'ads' | 'profile' | 'categories';

interface TabButtonComponentProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Dashboard: React.FC = () => {
  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState<TabName>('ads'); 
  
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

  const TabButton: React.FC<TabButtonComponentProps> = ({ icon: Icon, label, isActive, onClick }) => {
    return (
      <button
        onClick={onClick}
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


  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto py-8">
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 hidden md:block">
            Панель Управления {user && user.role === "admin" && "(Администратор)"}
          </h1>
          
          {/* Навигация по вкладкам (Tabs) */}
          <div className="flex border-b border-gray-200 mb-8">
            <TabButton 
              icon={FiGrid} 
              label="Мои Объявления" 
              isActive={activeTab === 'ads'}
              onClick={() => setActiveTab('ads')}
            />
            <TabButton 
              icon={FiUser} 
              label="Настройки Профиля" 
              isActive={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            
            {/* 💡 ВКЛАДКА ТОЛЬКО ДЛЯ АДМИНА */}
            {user && user.role === "admin" && (
                <TabButton 
                  icon={FiList} 
                  label="Категории (Админ)" 
                  isActive={activeTab === 'categories'}
                  onClick={() => setActiveTab('categories')}
                />
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