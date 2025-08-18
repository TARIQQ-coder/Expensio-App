// LogIn.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Expensio1 from "../assets/Expensio1.jpg";
import Expensio2 from "../assets/Expensio2.jpg";
import Expensio3 from "../assets/Expensio3.jpg";
import Expensio4 from "../assets/Expensio4.jpg";
import { TbArrowsTransferUpDown } from "react-icons/tb";

const LogIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Add your login logic here (Firebase, API, etc.)
    console.log("User logged in:", formData);

    navigate("/expense-tracker"); // redirect after login
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: `url(${Expensio2})` }}
    >
      <div>
        {/* Header Section */}
        <div>
          <TbArrowsTransferUpDown className="text-5xl text-teal-400 mx-auto rotate-90" />
          <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-teal-50 via-teal-400 to-teal-900 bg-clip-text text-transparent tracking-wide">
            EXP<span className="text-7xl">e</span><span className="text-7xl">n</span>SIO
          </h1>
        </div>

        {/* Login Form */}
        <div className="bg-black/10 p-8 rounded-2xl shadow-lg w-106 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
            />

            <button
              type="submit"
              className="w-full bg-teal-400 text-black py-3 rounded-lg font-semibold hover:bg-teal-500 transition text-lg cursor-pointer"
            >
              Log In
            </button>
          </form>

          {/* Link to SignUp */}
          <p className="text-gray-300  text-center mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-teal-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
