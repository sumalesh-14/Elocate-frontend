"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import ClientIonIcon from "@/components/ClientIonIcon";
import logoSm from "../../../assets/elocate-sm.png";
import registerImage from "../../../assets/register.jpg";
import { authApi } from "@/lib/auth";
import { setEmail, setPhoneNumber, setRefreshToken, setToken, setUser, setUserID, setUserName, setfullname } from "../sign-in/auth";

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    role: "CITIZEN",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
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
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "mobileNumber":
        const phoneRegex = /^[+]?[0-9]{10,13}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ""))) {
          error = "Please enter a valid mobile number (10-13 digits)";
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
      case "address":
        if (value.trim().length < 5) {
          error = "Address must be at least 5 characters";
        }
        break;
      case "city":
        if (value.trim().length < 2) {
          error = "City is required";
        }
        break;
      case "state":
        if (value.trim().length < 2) {
          error = "State is required";
        }
        break;
      case "pincode":
        if (!/^\d{6}$/.test(value)) {
          error = "Pincode must be 6 digits";
        }
        break;
      case "latitude":
        if (!value) {
          error = "Latitude is required";
        }
        break;
      case "longitude":
        if (!value) {
          error = "Longitude is required";
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

  const detectLocation = () => {
    if (navigator.geolocation) {
      const loadingToast = toast.loading("Fetching location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          setErrors((prev) => ({
            ...prev,
            latitude: "",
            longitude: "",
          }));
          toast.update(loadingToast, {
            render: "Location detected successfully!",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
          toast.update(loadingToast, {
            render: "Unable to retrieve location. Please enter manually.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const register = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isFullNameValid = validateField("fullName", formData.fullName);
    const isEmailValid = validateField("email", formData.email);
    const isPhoneValid = validateField("mobileNumber", formData.mobileNumber);
    const isPasswordValid = validateField("password", formData.password);
    const isConfirmPasswordValid = validateField("confirmPassword", formData.confirmPassword);
    const isAddressValid = validateField("address", formData.address);
    const isCityValid = validateField("city", formData.city);
    const isStateValid = validateField("state", formData.state);
    const isPincodeValid = validateField("pincode", formData.pincode);
    const isLatitudeValid = validateField("latitude", formData.latitude);
    const isLongitudeValid = validateField("longitude", formData.longitude);

    if (
      !isFullNameValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isAddressValid ||
      !isCityValid ||
      !isStateValid ||
      !isPincodeValid ||
      !isLatitudeValid ||
      !isLongitudeValid
    ) {
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
      const response = await authApi.register(formData);

      if (response.status != 200) {
        throw new Error("Registration failed. Please try again.");
      }

      const { user, tokens } = response.data;
      if (user && tokens) {
        setUser(user);
        setEmail(user.email);
        setToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        setPhoneNumber(user.mobileNumber);
        setfullname(user.fullName);
        setUserID(user.id);
        if (user.username) {
          setUserName(user.username);
        }
      }

      toast.update(loadingToast, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.href = "/citizen/sign-up/verify-email";
      }, 1000);
    } catch (error: any) {
      console.error("Register failed:", error);
      const errorMessage =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.update(loadingToast, {
        render: `Registration Failed. ${errorMessage}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
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
              <Image src={logoSm} alt="ELocate" width={150} height={40} />
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
                Create your account and start making a real impact on our planet's
                future through responsible e-waste management.
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
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-emerald-900 font-bold text-lg mb-1">
                    Track Your Impact
                  </h3>
                  <p className="text-emerald-700 text-base">
                    Monitor your recycling contributions in real-time
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-4 bg-emerald-100 rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-emerald-900 font-bold text-lg mb-1">
                    Find Facilities
                  </h3>
                  <p className="text-emerald-700 text-base">
                    Locate nearby e-waste collection centers easily
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-4 bg-emerald-100 rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-emerald-900 font-bold text-lg mb-1">
                    Learn & Grow
                  </h3>
                  <p className="text-emerald-700 text-base">
                    Access educational resources on sustainability
                  </p>
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
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2,
          }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="w-full max-w-4xl bg-white border-2 border-emerald-300 rounded-2xl shadow-lg p-8 lg:p-12 relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-6xl font-bold text-emerald-600 mb-2"
              style={{ fontFamily: "var(--ff-cuprum)" }}
            >
              Create Account
            </h1>
            <p className="text-lg text-gray-600">
              Join us in making the world greener
            </p>
          </div>

          {/* Form */}
          <form onSubmit={register} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <ClientIonIcon icon="personOutline" className="text-xl" />
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
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email & Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon="mailOutline" className="text-xl" />
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
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon icon="callOutline" className="text-xl" />
                  </div>
                  <input
                    required
                    type="tel"
                    name="mobileNumber"
                    placeholder="+91 9999999999"
                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    onChange={handleInputChange}
                    value={formData.mobileNumber}
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.mobileNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-4 left-0 pl-3 flex items-start pointer-events-none text-gray-400">
                  <ClientIonIcon icon="locationOutline" className="text-xl" />
                </div>
                <textarea
                  required
                  rows={2}
                  name="address"
                  placeholder="Street Address, Area"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  onChange={handleInputChange}
                  value={formData.address}
                />
              </div>
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  City
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  placeholder="City"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  onChange={handleInputChange}
                  value={formData.city}
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  State
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  placeholder="State"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  onChange={handleInputChange}
                  value={formData.state}
                />
                {errors.state && (
                  <p className="text-red-600 text-sm mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  required
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  maxLength={6}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  onChange={handleInputChange}
                  value={formData.pincode}
                />
                {errors.pincode && (
                  <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>

            {/* Location (Latitude & Longitude) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  name="latitude"
                  placeholder="Latitude"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  onChange={handleInputChange}
                  value={formData.latitude}
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  name="longitude"
                  placeholder="Longitude"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  onChange={handleInputChange}
                  value={formData.longitude}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="w-full bg-emerald-100 text-emerald-700 font-bold py-3 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-300 flex items-center justify-center gap-2"
                >
                  <ClientIonIcon icon="locateOutline" className="text-xl" />
                  Auto Detect
                </button>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon
                      icon="lockClosedOutline"
                      className="text-xl"
                    />
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
                    <ClientIonIcon
                      icon={showPassword ? "eyeOffOutline" : "eyeOutline"}
                      className="text-xl"
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ClientIonIcon
                      icon="lockClosedOutline"
                      className="text-xl"
                    />
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
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={
                isLoading ||
                Object.values(errors).some((error) => error !== "") ||
                !formData.fullName ||
                !formData.email ||
                !formData.mobileNumber ||
                !formData.address ||
                !formData.city ||
                !formData.state ||
                !formData.pincode ||
                !formData.latitude ||
                !formData.longitude ||
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
              <Link
                href="/citizen/sign-in"
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
              >
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



