// src/App.tsx
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import CreateAd from "./pages/CreateAd";
import Navbar from "./components/Navbar";
import EditAd from "./pages/EditAd";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./privateRoutes/PrivateRoute";
import { useAppDispatch } from "./store/hooks";
import { setUser } from "./store/slices/authSlice";
import PublicHome from "./pages/PublicHome";
import CategoryPage from "./pages/CategoryPage";
import AdView from "./pages/AdView";
import Favorites from "./pages/Favorites"; 
import Chats from "./pages/chats";
import UserProfile from "./pages/UserProfile";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import type { User } from "./types/user.types";

function App() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        dispatch(setUser(user));
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    }
  }, [dispatch]); 
  
  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      {/* Модальные окна */}
      <LoginModal />
      <RegisterModal />
      {/* Главный контейнер для контента */}
      <div className="min-h-screen md:min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-slate-900 pb-20 md:pb-0 transition-colors duration-200"> 
        <Routes>
          <Route path="/" element={<PublicHome />} />
          <Route path="/ad-view/:id" element={<AdView />} />
          <Route path="/user/:id" element={<UserProfile />} />
          
          {/* 🔒 ЗАЩИЩЕННЫЕ МАРШРУТЫ */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/create" element={<PrivateRoute><CreateAd /></PrivateRoute>} />
          <Route path="/edit-ad/:id" element={<PrivateRoute><EditAd /></PrivateRoute>} />
          
          {/* 💡 НОВЫЙ ЗАЩИЩЕННЫЙ МАРШРУТ: Избранное */}
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="/chats" element={<PrivateRoute><Chats /></PrivateRoute>} />
          
          {/* 🌐 РОУТЫ КАТЕГОРИЙ (должен быть последним, чтобы не перехватывать другие роуты) */}
          <Route path="/:slug" element={<CategoryPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;