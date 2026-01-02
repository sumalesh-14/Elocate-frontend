"use client";
import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-20 px-4 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl opacity-20" />
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 font-cuprum tracking-tight"
                    >
                        Terms of Service
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-teal-50 max-w-3xl mx-auto leading-relaxed"
                    >
                        Rules and guidelines for interacting with ELocate's digital ecosystem and e-waste management platform.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-4 -mt-10">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-16">
                        <div className="prose prose-teal max-w-none space-y-12 text-gray-700">

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-teal-600 rounded-full" />
                                    1. Acceptance of Terms
                                </h2>
                                <p className="text-lg leading-relaxed">
                                    By accessing and using the ELocate platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using our services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-teal-600 rounded-full" />
                                    2. User Responsibilities
                                </h2>
                                <div className="grid gap-6">
                                    <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
                                        <h4 className="font-bold text-teal-800 mb-2 underline underline-offset-4">Account Integrity</h4>
                                        <p className="text-sm">Users are responsible for maintaining the confidentiality of their credentials and all activities under their account.</p>
                                    </div>
                                    <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
                                        <h4 className="font-bold text-teal-800 mb-2 underline underline-offset-4">Accurate Disposal</h4>
                                        <p className="text-sm">When booking recycling services, users must provide accurate information about the e-waste category and condition.</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-teal-600 rounded-full" />
                                    3. Sustainable Usage Policy
                                </h2>
                                <p className="text-lg leading-relaxed mb-4">
                                    ELocate is dedicated to environmental sustainability. Users agree to:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li>Only interact with certified recycling facilities listed on our platform.</li>
                                    <li>Refrain from using the platform for unauthorized commercial gain or data scraping.</li>
                                    <li>Respect the appointment timings agreed upon with facility operators.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-teal-600 rounded-full" />
                                    4. Limitation of Liability
                                </h2>
                                <p className="text-lg leading-relaxed italic text-gray-500">
                                    While ELocate strives for accuracy, the platform provides information about third-party facilities "as is". ELocate shall not be liable for any direct or indirect damages resulting from your interaction with certified facilities or the disposal process.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-3xl font-bold text-gray-900 font-cuprum mb-6 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-teal-600 rounded-full" />
                                    5. Modifications to Service
                                </h2>
                                <p className="text-lg leading-relaxed">
                                    We reserve the right to modify or discontinue ELocate services at any time. We also reserve the right to update these Terms of Service. Continued use of the platform after updates constitutes acceptance of the new terms.
                                </p>
                            </section>

                            <div className="pt-12 border-t border-gray-100 text-center">
                                <p className="text-gray-500 italic">Version: 1.2 | Effective Date: January 2, 2026</p>
                                <p className="mt-4 text-teal-700 font-semibold">Legal Department: legal@elocate.com</p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsOfService;
