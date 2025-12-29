"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import {
    setEmail,
    setPhoneNumber,
    setToken,
    setUser,
    setUserID,
    setUserName,
    setfullname
} from "../citizen/sign-in/auth";
import ClientIonIcon from "../utils/ClientIonIcon";
import {
    mailOutline,
    lockClosedOutline,
    eyeOutline,
    eyeOffOutline,
    logoGithub,
    logoGoogle,
    leafOutline
} from "ionicons/icons";
import logo from "../../assets/ELocate-s.png";
import bannerImage from "../../assets/ewaste_login_banner.png";

const CommonLogin: React.FC = () => {
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
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulating API call
        const loadingToast = toast.loading("Verifying credentials...");

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // DUMMY BYPASS Logic
            const user = {
                id: "dummy-user-id-123",
                email: formData.email || "user@example.com",
                token: "dummy-jwt-token-for-testing",
                phoneNumber: "1234567890",
                fullname: "E-Waste Connector",
                username: formData.email.split('@')[0] || "ecouser",
            };

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
                window.location.href = "/";
            }, 1000);

        } catch (error) {
            console.error("Login failed:", error);
            toast.update(loadingToast, {
                render: "Authentication failed. Please check your credentials.",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-montserrat">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="light"
            />

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
                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                            "The greatest threat to our planet is the belief that someone else will save it."
                        </h2>
                        <p className="text-xl text-emerald-300 font-medium italic">
                            — Join the movement to recycle 10,000 tons of e-waste this year.
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
                <div className="w-full max-w-md">
                    {/* Logo & Header */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-10 text-center md:text-left"
                    >
                        <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <ClientIonIcon icon={leafOutline} className="text-3xl text-emerald-600" />
                            </div>
                            <span className="text-2xl font-bold text-gray-800 tracking-tight">EcoCycle</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-gray-400">
                                    <ClientIonIcon icon={mailOutline} className="text-xl" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-gray-700"
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
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                                <Link href="/forgot-password" title="Forgot password?" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-gray-400">
                                    <ClientIonIcon icon={lockClosedOutline} className="text-xl" />
                                </div>
                                <input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    className="block w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-gray-700"
                                    onChange={handleInputChange}
                                    value={formData.password}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ClientIonIcon icon={showPassword ? eyeOffOutline : eyeOutline} className="text-xl" />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg border-b-4 border-emerald-800 hover:bg-emerald-500 hover:shadow-emerald-200 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                            </button>
                        </motion.div>
                    </form>

                    {/* Social Logins */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-10"
                    >
                        <div className="relative flex items-center mb-8">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest font-semibold">Or continue with</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700">
                                <ClientIonIcon icon={logoGithub} className="text-xl" />
                                GitHub
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700">
                                <ClientIonIcon icon={logoGoogle} className="text-xl" />
                                Google
                            </button>
                        </div>
                    </motion.div>

                    {/* Footer Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 text-center text-gray-500 font-medium"
                    >
                        Don't have an account?{" "}
                        <Link href="/sign-up" className="text-emerald-600 font-bold hover:underline underline-offset-4 decoration-2 decoration-emerald-200">
                            Sign up for free
                        </Link>
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default CommonLogin;
