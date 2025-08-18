// SignUp.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Expensio1 from "../assets/Expensio1.jpg";
import Expensio2 from "../assets/Expensio2.jpg";
import Expensio3 from "../assets/Expensio3.jpg";
import Expensio4 from "../assets/Expensio4.jpg";
import { TbArrowsTransferUpDown } from "react-icons/tb";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // TODO: Add your signup logic here (Firebase, API, etc.)
    console.log("User registered:", formData);

    navigate("/login");
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: `url(${Expensio1})` }}
    >
      <div>

        <div>
            <div>
              <TbArrowsTransferUpDown className="text-5xl text-teal-400 mx-auto  rotate-90" />
            </div>
            <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-teal-50 via-teal-400 to-teal-900 bg-clip-text text-transparent tracking-wide">
      EXP<span className="text-7xl">e</span><span className="text-7xl">n</span>SIO
    </h1>

        </div>

      <div className=" bg-black/10 p-8 rounded-2xl shadow-lg w-106 backdrop-blur-sm">

      
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none "
          />

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none "
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none "
          />

          <button
            type="submit"
            className="w-full bg-teal-400 text-black py-3 rounded-lg font-semibold hover:bg-teal-500 transition text-lg cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        {/* Already have account */}
        <p className="text-gray-300 text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default SignUp;
