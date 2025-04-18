import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./home.jsx";
import Login from "./loginpage.jsx";
import QuestionsList from "./questionsList.jsx";
import ForgotPassword from "./forgetPassword.jsx";
import ResetPassword from "./resetPassword.jsx";
import PrivateRoute from "./PrivateRoute.jsx"; // <-- import it

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/home/:id"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <PrivateRoute>
              <QuestionsList />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
