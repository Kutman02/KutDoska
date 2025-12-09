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
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import PublicHome from "./pages/PublicHome";
import AdView from "./pages/AdView";



function App() {
  const {setUser} = useContext(AuthContext)
  
  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
  
  return (
    <>
    <Toaster position="top-right" />
      <Navbar />
      {/* Главный контейнер для контента:
        - min-h-screen на мобильных, pb-20 (отступ для нижней панели).
        - md:min-h-[calc(100vh-4rem)] на десктопе (учитываем верхнюю панель), md:pb-0 (убираем нижний отступ).
      */}
      <div className="min-h-screen md:min-h-[calc(100vh-4rem)] bg-gray-50 pb-20 md:pb-0"> 
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/ad-view/:id" element={<AdView />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/create" element={<PrivateRoute><CreateAd /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/edit-ad/:id" element={<PrivateRoute><EditAd /></PrivateRoute>} />
          </Routes>
      </div>
    </>
  );
}

export default App;