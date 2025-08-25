import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./components/Home";
import ExpensesPage from "./pages/ExpensesPage";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth pages */}
          <Route path="/" element={<SignUp />} /> {/* Default page */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="trips" element={<div>Trips Page</div>} />
            <Route path="approvals" element={<div>Approvals Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
            <Route path="support" element={<div>Support Page</div>} />
          </Route>
        </Routes>

        {/* ✅ Toastify container for global notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
