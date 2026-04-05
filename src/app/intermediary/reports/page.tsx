"use client";

import { useState } from "react";
import { BarChart2, FileText, Users, DollarSign, Calendar } from "lucide-react";
import WasteVolumeChart from "./components/WasteVolumeChart";
import ExportWidget from "./components/ExportWidget";
import CpcbComplianceView from "./components/CpcbComplianceView";
import DriverStatsView from "./components/DriverStatsView";
import FinancialsView from "./components/FinancialsView";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "compliance", label: "CPCB Compliance", icon: FileText },
    { id: "drivers", label: "Driver Stats", icon: Users },
    { id: "financials", label: "Financials", icon: DollarSign },
  ];

  return (
    <div className="flex flex-col gap-6 w-full px-2 lg:px-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-500 font-medium mt-1">Track facility performance, operations, and compliance logs.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 transition-colors px-4 py-2.5 rounded-xl shadow-sm focus-within:ring-2 ring-emerald-500/20">
            <Calendar size={16} className="text-emerald-600" />
            <select className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
          <ExportWidget />
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold transition-all ${
              activeTab === t.id 
                ? "border-emerald-600 text-emerald-700" 
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "overview" && <WasteVolumeChart />}
        {activeTab === "compliance" && <CpcbComplianceView />}
        {activeTab === "drivers" && <DriverStatsView />}
        {activeTab === "financials" && <FinancialsView />}
      </div>

    </div>
  );
}
