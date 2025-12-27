// src/App.jsx
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import CreateAd from "./pages/CreateAd";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import EditAd from "./pages/EditAd";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./privateRoutes/PrivateRoute";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setUser } from "./store/slices/authSlice";
import PublicHome from "./pages/PublicHome";
import AdView from "./pages/AdView";
import Favorites from "./pages/Favorites"; 
import Chats from "./pages/chats";
import UserProfile from "./pages/UserProfile";

function App() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    }
  }, [dispatch]); 
  
  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      {/* Главный контейнер для контента */}
      <div className="min-h-screen md:min-h-[calc(100vh-4rem)] bg-gray-50 pb-20 md:pb-0"> 
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

          {/* 🌐 ПУБЛИЧНЫЕ МАРШРУТЫ */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </>
  );
}

export default App;