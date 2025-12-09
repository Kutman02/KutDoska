// src/components/PrivateRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";



const PrivateRoute = ({ children }) => {
    const {user}=useContext(AuthContext)
  const token = localStorage.getItem("token"); // or use Auth Context

  return token && user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
