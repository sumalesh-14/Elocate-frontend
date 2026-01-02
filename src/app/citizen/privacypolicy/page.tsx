/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl opacity-20" />
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 font-cuprum tracking-tight"
                    >
                        Privacy Policy
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-emerald-50 max-w-3xl mx-auto leading-relaxed"
                    >
                        Your privacy is paramount. Learn how ELocate protects and manages your data in our commitment to transparency.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-4 -mt-10">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-16">
                        <div className="prose prose-emerald max-w-none space-y-12 text-gray-700">

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-emerald-600 rounded-full" />
                                    1. Information We Collect
                                </h2>
                                <p className="text-lg leading-relaxed mb-4">
                                    ELocate collects information to provide better services to all our users. We collect information in the following ways:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Personal Information:</strong> Name, contact details, and location data provided during registration or when locating facilities.</li>
                                    <li><strong>Device Information:</strong> Information about your computer or mobile device to optimize our application's performance.</li>
                                    <li><strong>Usage Data:</strong> Detailed analytics on how you interact with our e-waste management resources.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-emerald-600 rounded-full" />
                                    2. How We Use Information
                                </h2>
                                <p className="text-lg leading-relaxed mb-4">
                                    We use the information we collect to provide, maintain, protect and improve our services, and to protect ELocate and our users:
                                </p>
                                <ul className="space-y-4">
                                    <li className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 italic">
                                        "We use location data exclusively to help you find the nearest certified e-waste recycling facilities."
                                    </li>
                                    <li><strong>Service Improvement:</strong> Analyzing usage patterns to enhance user experience and resource accessibility.</li>
                                    <li><strong>Communication:</strong> Sending updates about e-waste regulations, facility changes, and sustainability news.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-emerald-600 rounded-full" />
                                    3. Data Security and Protection
                                </h2>
                                <p className="text-lg leading-relaxed mb-4">
                                    We work hard to protect ELocate and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold:
                                </p>
                                <div className="grid md:grid-cols-2 gap-6 mt-8">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <h4 className="font-bold text-emerald-700 mb-2">Encryption</h4>
                                        <p className="text-sm">We encrypt our services using SSL/TLS to ensure data safety during transmission.</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <h4 className="font-bold text-emerald-700 mb-2">Access Control</h4>
                                        <p className="text-sm">We restrict access to personal information to ELocate employees and contractors on a need-to-know basis.</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-emerald-600 rounded-full" />
                                    4. Your Privacy Choices
                                </h2>
                                <p className="text-lg leading-relaxed">
                                    You have control over your data. You can access your profile settings to manage communication preferences, update personal information, or request data deletion. We are committed to honoring your data rights under the prevailing Indian data protection laws.
                                </p>
                            </section>

                            <div className="pt-12 border-t border-gray-100 text-center">
                                <p className="text-gray-500 italic">Last Updated: January 2, 2026</p>
                                <p className="mt-4 text-emerald-700 font-semibold">Questions? Contact us at privacy@elocate.com</p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
