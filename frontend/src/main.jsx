import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Register from "./Register.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OnlineJudge from "./onlineJudge.jsx";
import Login from "./loginpage.jsx";
import QuestionsList from "./questionsList.jsx";
import ForgotPassword from "./forgetPassword.jsx";
import ResetPassword from "./resetPassword.jsx";
import PrivateRoute from "./PrivateRoute.jsx"; // <-- import it

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔐 Protected routes */}
        <Route
          path="/home/:id"
          element={
            <PrivateRoute>
              <OnlineJudge />
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
