import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import CreateNote from "./pages/CreateNote";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import EditNotes from "./pages/EditNotes";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./privateRoutes/PrivateRoute";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import PublicHome from "./pages/PublicHome";



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
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/create" element={<PrivateRoute><CreateNote /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit-notes/:id" element={<PrivateRoute><EditNotes /></PrivateRoute>} />
        {/* Добавил PrivateRoute для EditNotes, чтобы только зарегистрированные пользователи могли редактировать */}
      </Routes>
    </>
  );
}

export default App;