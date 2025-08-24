import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Register from "./Register.jsx";
import { HashRouter, Routes, Route, Link } from "react-router-dom"; // 👈 include Link
import OnlineJudge from "./onlineJudge.jsx";
import Login from "./loginpage.jsx";
import QuestionsList from "./questionsList.jsx";
import ForgotPassword from "./forgetPassword.jsx";
import ResetPassword from "./resetPassword.jsx";
import PrivateRoute from "./PrivateRoute.jsx";

// Optional: Simple navigation bar for testing routes
function Navigation() {
  return (
    <nav style={{ marginBottom: "20px" }}>
      <Link to="/">Register</Link> |{" "}
      <Link to="/login">Login</Link> |{" "}
      <Link to="/forgot-password">Forgot Password</Link> |{" "}
      <Link to="/questions">Questions</Link>
    </nav>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <Navigation /> {/* 👈 Add navigation bar */}
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
    </HashRouter>
  </StrictMode>
);
