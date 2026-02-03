"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { setEmail, setPhoneNumber, setToken, setUser, setUserID, setUserName, setfullname } from "./auth";
import ClientIonIcon from "../../utils/ClientIonIcon";
import logo from "../../../assets/ELocate-s.png";
import bannerImage from "../../../assets/ewaste_login_banner.png";

const Signin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Verifying credentials...");

    try {
      // --- DUMMY AUTHENTICATION START ---
      const user = {
        id: "dummy-citizen-id-789",
        email: formData.email || "citizen@elocate.com",
        token: "dummy-citizen-token",
        phoneNumber: "7777777777",
        fullname: "Citizen User",
        username: "citizenuser",
      };

      /* ORIGINAL API CALL - Uncomment for production
      const response = await axios.post(
        "http://localhost:8080/elocate/api/v1/auth/login",
        formData
      );
      const user = response.data;
      */
      // --- DUMMY AUTHENTICATION END ---

      console.log(user);
      localStorage.setItem("user", JSON.stringify(user));

      if (user) {
        setUser(user);
        setEmail(user.email);
        setToken(user.token);
        setPhoneNumber(user.phoneNumber);
        setfullname(user.fullname);
        setUserID(user.id);
        if (user.username) {
          setUserName(user.username);
        }
      }

      toast.update(loadingToast, {
        render: "Login Successful! Welcome back.",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });

      setTimeout(() => {
        window.location.href = "/citizen";
      }, 1000);

    } catch (error) {
      console.error("Login failed:", error);
      toast.update(loadingToast, {
        render: "Login Failed. Please check your credentials.",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-montserrat relative">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      {/* Floating Register Button - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="absolute top-8 right-8 z-50 hidden md:block"
      >
        <Link href="/citizen/sign-up">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
          >
            <ClientIonIcon icon="personAddOutline" className="text-2xl" />
            <span className="text-lg">Create Account</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Left Section - Image & Quote */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex md:w-1/2 relative bg-emerald-900 text-white overflow-hidden"
      >
        <Image
          src={bannerImage}
          alt="E-waste recycling"
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />

        {/* Animated Background Overlay */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col justify-end p-16 w-full bg-gradient-to-t from-black/80 to-transparent">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--ff-cuprum)' }}>
              "Join thousands making a difference in e-waste management."
            </h2>
            <p className="text-2xl text-emerald-300 font-medium italic">
              — Your journey to a greener planet starts here.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section - Login Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white"
      >
        <div className="w-full max-w-lg">
          {/* Logo & Header */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-10 text-center md:text-left"
          >
            <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Image src={logo} alt="ELocate" width={60} height={60} />
              </div>
              <span className="text-3xl font-bold text-emerald-800 tracking-tight" style={{ fontFamily: 'var(--ff-cuprum)' }}>ELocate</span>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'var(--ff-cuprum)' }}>Welcome back</h1>
            <p className="text-xl text-gray-500 font-medium">Sign in to continue your eco-journey.</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={login} className="space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-lg font-bold text-gray-800 mb-3 ml-1">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-gray-400">
                  <ClientIonIcon icon="mailOutline" className="text-2xl" />
                </div>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-xl font-medium text-gray-800"
                  onChange={handleInputChange}
                  value={formData.email}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between mb-3">
                <label className="text-lg font-bold text-gray-800 ml-1">Password</label>
                <Link href="/citizen/forget-password" className="text-lg font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-gray-400">
                  <ClientIonIcon icon="lockClosedOutline" className="text-2xl" />
                </div>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="block w-full pl-14 pr-14 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-xl font-medium text-gray-800"
                  onChange={handleInputChange}
                  value={formData.password}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ClientIonIcon icon={showPassword ? "eyeOffOutline" : "eyeOutline"} className="text-2xl" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-6 rounded-[1.5rem] shadow-xl shadow-emerald-200 border-b-4 border-emerald-800 hover:bg-emerald-500 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed text-2xl"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </motion.div>
          </form>

          {/* Enhanced Register Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-14 text-center"
          >
            <p className="text-xl text-gray-500 font-semibold mb-6">
              Don't have an account?
            </p>
            <Link href="/citizen/sign-up">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 font-bold text-xl rounded-2xl border-2 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-3 mx-auto"
              >
                <span>Create your free account</span>
                <ClientIonIcon icon="arrowForwardOutline" className="text-2xl" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signin;


