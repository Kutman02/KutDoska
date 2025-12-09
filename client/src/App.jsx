import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import CreateAd from "./pages/CreateAd"; // ИЗМЕНЕНО: CreateNote -> CreateAd
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import EditAd from "./pages/EditAd"; // ИЗМЕНЕНО: EditNotes -> EditAd
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
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/ad-view/:id" element={<AdView />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        {/* ИЗМЕНЕНО: CreateNote -> CreateAd */}
        <Route path="/create" element={<PrivateRoute><CreateAd /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* ИЗМЕНЕНО: /edit-notes/:id -> /edit-ad/:id и EditNotes -> EditAd */}
        <Route path="/edit-ad/:id" element={<PrivateRoute><EditAd /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default App;