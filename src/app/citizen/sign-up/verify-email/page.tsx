"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientIonIcon from "../../../utils/ClientIonIcon";
import logo from "../../../../assets/ELocate-s.png";
import bannerImage from "../../../../assets/ewaste_login_banner.png";
import { authApi } from "@/app/auth/routes";
import { useRouter } from "next/navigation";

const VerifyEmail: React.FC = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(0);
    const router = useRouter();

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authApi.verifyEmail({ email, otp });
            const message = response.data?.message || "Email verified successfully";

            if (response.status === 200) {
                toast.success(message, {
                    position: "top-right",
                    autoClose: 3000,
                });
                setTimeout(() => {
                    router.push("/sign-in");
                }, 1500);
            } else {
                toast.error(message, {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "An error occurred during verification";
            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email address first.");
            return;
        }
        setIsResending(true);
        const creds = {
            email: email,
            type: "EMAIL_VERIFICATION"
        }
        try {
            const response = await authApi.resendOtp(creds);
            const message = response.data?.message || "OTP sent successfully";
            if (response.status === 200) {
                toast.success(message);
                setTimer(60); // Start 60s cooldown
            } else {
                toast.error(message);
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to resend OTP";
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-montserrat relative">
            <ToastContainer position="top-right" autoClose={3000} theme="light" />

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
                            "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)",
                        ],
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
                        <h2
                            className="text-4xl lg:text-5xl font-bold leading-tight mb-6"
                            style={{ fontFamily: "var(--ff-cuprum)" }}
                        >
                            "Verify your identity to start your journey."
                        </h2>
                        <p className="text-2xl text-emerald-300 font-medium italic">
                            — Secure and seamless access.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Section - Verify Email Form */}
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
                            <span
                                className="text-3xl font-bold text-emerald-800 tracking-tight"
                                style={{ fontFamily: "var(--ff-cuprum)" }}
                            >
                                ELocate
                            </span>
                        </div>
                        <h1
                            className="text-5xl font-extrabold text-gray-900 mb-4"
                            style={{ fontFamily: "var(--ff-cuprum)" }}
                        >
                            Verify Email
                        </h1>
                        <p className="text-xl text-gray-500 font-medium">
                            Enter your email and the OTP sent to you.
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="block text-lg font-bold text-gray-800 mb-3 ml-1">
                                Email address
                            </label>
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
                                    onChange={handleEmailChange}
                                    value={email}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-lg font-bold text-gray-800 mb-3 ml-1">
                                OTP
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-gray-400">
                                    <ClientIonIcon icon="keyOutline" className="text-2xl" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    name="otp"
                                    placeholder="Enter OTP"
                                    className="block w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-xl font-medium text-gray-800"
                                    onChange={handleOtpChange}
                                    value={otp}
                                />
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
                                disabled={isLoading || !email || !otp}
                                type="submit"
                                className="w-full bg-emerald-600 text-white font-bold py-6 rounded-[1.5rem] shadow-xl shadow-emerald-200 border-b-4 border-emerald-800 hover:bg-emerald-500 transition-all active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed text-2xl"
                            >
                                {isLoading ? "Verifying..." : "Verify Email"}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.65 }}
                            className="text-center"
                        >
                            <p className="text-gray-600 font-medium mb-3">
                                Didn't receive the code?
                            </p>
                            <button
                                type="button"
                                disabled={timer > 0 || isResending}
                                onClick={handleResendOtp}
                                className={`font-bold transition-colors mx-auto ${timer > 0 || isResending
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-emerald-600 hover:text-emerald-700 hover:underline"
                                    }`}
                            >
                                {timer > 0 ? `Resend in ${timer}s` : isResending ? "Sending..." : "Resend OTP"}
                            </button>
                        </motion.div>
                    </form>

                    {/* Back to Sign In Link */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-14 text-center"
                    >
                        <Link href="/signin">
                            <motion.button
                                whileHover={{
                                    scale: 1.03,
                                    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)",
                                }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 font-bold text-xl rounded-2xl border-2 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-3 mx-auto"
                            >
                                <ClientIonIcon icon="arrowBackOutline" className="text-2xl" />
                                <span>Back to Sign In</span>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
