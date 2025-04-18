// PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // Change this key based on your login logic
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
