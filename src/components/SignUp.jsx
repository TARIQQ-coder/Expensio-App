import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Expensio1 from "../assets/Expensio1.jpg";
import { TbArrowsTransferUpDown } from "react-icons/tb";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const userSchema = z
  .object({
    displayName: z
      .string()
      .min(1, { message: "Name is required" })
      .max(50, { message: "Name must be 50 characters or less" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(userCredential.user, {
        displayName: data.displayName,
      });

      const docRef = doc(db, "users", userCredential.user.uid);
      await setDoc(docRef, {
        email: data.email,
        displayName: data.displayName,
        uid: userCredential.user.uid,
        createdAt: new Date(),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);
      let message = "Something went wrong. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        message = "Email is already in use. Please use a different email.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address. Please check and try again.";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak. Please use a stronger password.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Network error. Please check your internet connection.";
      }

      toast.error(message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastClassName: "bg-gray-900 text-white font-medium rounded-lg shadow-lg",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: `url(${Expensio1})` }}
    >
      <div>
        {/* Header Section */}
        <div>
          <TbArrowsTransferUpDown className="text-5xl text-teal-400 mx-auto rotate-90" />
          <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-teal-50 via-teal-400 to-teal-900 bg-clip-text text-transparent tracking-wide">
            EXP<span className="text-7xl">e</span>
            <span className="text-7xl">n</span>SIO
          </h1>
        </div>

        {/* Sign Up Form */}
        <div className="bg-black/10 p-8 rounded-2xl shadow-lg w-96 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="text"
                {...register("displayName")}
                placeholder="Enter name"
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
                aria-invalid={errors.displayName ? "true" : "false"}
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                {...register("email")}
                placeholder="Enter email"
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...register("password")}
                placeholder="Enter password"
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm password"
                className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 outline-none"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-lg cursor-pointer ${
                loading
                  ? "bg-teal-300 text-gray-600 cursor-not-allowed"
                  : "bg-teal-400 text-black hover:bg-teal-500 transition"
              }`}
              aria-label="Sign up"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          {/* Link to Log In */}
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