"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import ClientIonIcon from "../../utils/ClientIonIcon";
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  callOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline
} from "ionicons/icons";
import logoSm from "../../../assets/elocate-sm.png";
import registerImage from "../../../assets/register.jpg";

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "fullName":
        if (value.trim().length < 2) {
          error = "Full name must be at least 2 characters";
        }
        break;
      case "lastname":
        if (value.trim().length < 2) {
          error = "Last name must be at least 2 characters";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phoneNumber":
        const phoneRegex = /^[+]?[0-9]{10,13}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ""))) {
          error = "Please enter a valid phone number (10-13 digits)";
        }
        break;
      case "password":
        if (value.length < 8) {
          error = "Password must be at least 8 characters";
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate on change
    validateField(name, value);
  };

  const register = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isFullNameValid = validateField("fullName", formData.fullName);
    const isLastNameValid = validateField("lastname", formData.lastname);
    const isEmailValid = validateField("email", formData.email);
    const isPhoneValid = validateField("phoneNumber", formData.phoneNumber);
    const isPasswordValid = validateField("password", formData.password);
    const isConfirmPasswordValid = validateField("confirmPassword", formData.confirmPassword);

    if (!isFullNameValid || !isLastNameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isConfirmPasswordValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      const response = await axios.post(
        "https://elocate-server.onrender.com/api/v1/auth/register",
        formData
      );

      toast.update(loadingToast, {
        render: "Registration Successful! Redirecting to login...",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });

      setTimeout(() => {
        window.location.href = "/citizen/sign-in";
      }, 1000);

    } catch (error: any) {
      console.error("Register failed:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.update(loadingToast, {
        render: `Registration Failed. ${errorMessage}`,
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch relative overflow-hidden bg-white">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      {/* Left Side - Image & Welcome Content */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white overflow-hidden z-20">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-50 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-10 w-full">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-2"
          >
            {/* Logo (NO space-y applied) */}
            <div className="mb-6 ml-20">
              <Image
                src={logoSm}
                alt="ELocate"
                width={150}
                height={40}
              />
            </div>
            {/* Main Heading */}
            {/* Text Content */}
            <div className="space-y-6 mt-0 mb-0 ml-20">
              <h1
                className="text-6xl font-extrabold text-gray-900 leading-tight"
                style={{ fontFamily: "var(--ff-cuprum)" }}
              >
                Join the
                <br />
                <span className="text-emerald-600">Green Revolution</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-md">
                Create your account and start making a real impact on our planet's future through responsible e-waste management.
              </p>
            </div>
            {/* Features List - Adjust width: max-w-md, max-w-lg, max-w-[500px] */}
            <div className="space-y-6 pt-4 ml-20 max-w-[500px]">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4 bg-emerald-100 rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-emerald-900 font-bold text-lg mb-1">Track Your Impact</h3>
                  <p className="text-emerald-700 text-base">Monitor your recycling contributions in real-time</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4 bg-emerald-100 rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-emerald-900 font-bold text-lg mb-1">Find Facilities</h3>
                  <p className="text-emerald-700 text-base">Locate nearby e-waste collection centers easily</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-4 bg-emerald-100 rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-emerald-900 font-bold text-lg mb-1">Learn & Grow</h3>
                  <p className="text-emerald-700 text-base">Access educational resources on sustainability</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="w-full max-w-4xl bg-white border-2 border-emerald-300 rounded-2xl shadow-lg p-8 lg:p-12 relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-emerald-600 mb-2" style={{ fontFamily: 'var(--ff-cuprum)' }}>
              Create Account
            </h1>
            <p className="text-lg text-gray-600">
              Join us in making the world greener
            </p>
          </div>

          {/* Form */}
          <form onSubmit={register} className="space-y-8">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon={personOutline} className="text-xl" />
                  </div>
                  <input
                    required
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onChange={handleInputChange}
                    value={formData.fullName}
                  />
                </div>
                {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon={personOutline} className="text-xl" />
                  </div>
                  <input
                    required
                    type="text"
                    name="lastname"
                    placeholder="Doe"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onChange={handleInputChange}
                    value={formData.lastname}
                  />
                </div>
                {errors.lastname && <p className="text-red-600 text-sm mt-1">{errors.lastname}</p>}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon={mailOutline} className="text-xl" />
                  </div>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onChange={handleInputChange}
                    value={formData.email}
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon={callOutline} className="text-xl" />
                  </div>
                  <input
                    required
                    type="tel"
                    name="phoneNumber"
                    placeholder="+91 9999999999"
                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onChange={handleInputChange}
                    value={formData.phoneNumber}
                  />
                </div>
                {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon={lockClosedOutline} className="text-xl" />
                  </div>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onChange={handleInputChange}
                    value={formData.password}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <ClientIonIcon icon={showPassword ? eyeOffOutline : eyeOutline} className="text-xl" />
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon={lockClosedOutline} className="text-xl" />
                  </div>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onChange={handleInputChange}
                    value={formData.confirmPassword}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading ||
                Object.values(errors).some(error => error !== "") ||
                !formData.fullName ||
                !formData.lastname ||
                !formData.email ||
                !formData.phoneNumber ||
                !formData.password ||
                !formData.confirmPassword
              }
              type="submit"
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-6"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/citizen/sign-in" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;


