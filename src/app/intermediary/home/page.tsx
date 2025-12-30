"use client";

import React from "react";
import { motion } from "framer-motion";
import ClientIonIcon from "../../utils/ClientIonIcon";
import { homeOutline, settingsOutline, logOutOutline, leafOutline, statsChartOutline, peopleOutline } from "ionicons/icons";
import { handleLogout, getUser } from "../../citizen/sign-in/auth";

const IntermediaryDashboard: React.FC = () => {
    const user = getUser();

    return (
        <div className="min-h-screen bg-gray-50 flex font-montserrat">
            {/* Sidebar */}
            <div className="w-64 bg-emerald-900 text-white p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <ClientIonIcon icon={leafOutline} className="text-2xl text-emerald-400" />
                    <span className="text-xl font-bold">EcoCycle</span>
                </div>

                <nav className="flex-grow space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-emerald-800 rounded-lg cursor-pointer">
                        <ClientIonIcon icon={homeOutline} className="text-xl" />
                        <span className="font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors">
                        <ClientIonIcon icon={statsChartOutline} className="text-xl" />
                        <span className="font-medium">Statistics</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors">
                        <ClientIonIcon icon={peopleOutline} className="text-xl" />
                        <span className="font-medium">Clients</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors">
                        <ClientIonIcon icon={settingsOutline} className="text-xl" />
                        <span className="font-medium">Settings</span>
                    </div>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 hover:bg-red-900/50 rounded-lg cursor-pointer transition-colors mt-auto text-red-200"
                >
                    <ClientIonIcon icon={logOutOutline} className="text-xl" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-grow p-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Intermediary Dashboard</h1>
                    <p className="text-gray-500 mb-8">Welcome back, {user?.fullname || "Intermediary"}!</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Total Collections</h3>
                            <p className="text-3xl font-bold text-emerald-600">1,204</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Pending Items</h3>
                            <p className="text-3xl font-bold text-orange-600">42</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">Completion Rate</h3>
                            <p className="text-3xl font-bold text-blue-600">94.2%</p>
                        </div>
                    </div>

                    <div className="mt-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Sample Data Section</h2>
                        <div className="h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">Sample data visualization or table will go here.</span>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default IntermediaryDashboard;
