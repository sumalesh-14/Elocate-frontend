"use client";
import React, { useState } from "react";
import Link from "next/link";
import DashboardSidebar from "../Components/DashboardSidebar";
import {
  MdEco,
  MdListAlt,
  MdCheckCircle,
  MdCancel,
  MdHelp,
  MdLaptopMac,
  MdSmartphone,
  MdPrint,
  MdLightbulb,
  MdLocationOn,
  MdAddCircle,
} from "react-icons/md";

// TypeScript Interfaces
interface UserStats {
  personalScore: number;
  scoreChange: string;
  totalRequests: number;
  itemsRecycled: number;
  cancelled: number;
  co2Diverted: string;
}

interface RecycleRequest {
  id: string;
  item: string;
  icon: React.ReactNode;
  status: "completed" | "pending" | "cancelled";
  date: string;
}

interface NearestCenter {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  mapImage: string;
}

const BookRecycle = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sample Data - TODO: Replace with API calls
  const userStats: UserStats = {
    personalScore: 850,
    scoreChange: "+12%",
    totalRequests: 24,
    itemsRecycled: 142,
    cancelled: 2,
    co2Diverted: "124 kg",
  };

  const recentRequests: RecycleRequest[] = [
    {
      id: "#REQ-8821",
      item: 'MacBook Pro 15"',
      icon: <MdLaptopMac className="text-2xl" />,
      status: "completed",
      date: "Oct 24, 2026",
    },
    {
      id: "#REQ-8822",
      item: "iPhone 11 - Broken",
      icon: <MdSmartphone className="text-2xl" />,
      status: "pending",
      date: "Nov 02, 2026",
    },
    {
      id: "#REQ-8819",
      item: "Canon Printer",
      icon: <MdPrint className="text-2xl" />,
      status: "cancelled",
      date: "Oct 15, 2026",
    },
  ];

  const nearestCenter: NearestCenter = {
    name: "Main Office HQ",
    address: "123 Green Valley Rd, Tech Park",
    city: "San Francisco",
    zipCode: "CA 94103",
    mapImage: "/api/placeholder/400/300", // TODO: Replace with actual map API
  };

  const ecoTip = "Before recycling your phone, ensure all data is wiped. We perform a secondary wipe, but safety first!";

  const getStatusBadge = (status: RecycleRequest["status"]) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm md:text-base font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main Container with Sidebar and Content */}
      <div className="flex flex-1">
        <DashboardSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          userStats={{ co2Diverted: userStats.co2Diverted }}
        />

        {/* Main Content */}
        <main className="flex-1 h-full flex flex-col overflow-hidden bg-white md:ml-80">
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-10 md:py-6">
            <div className="w-full flex flex-col gap-8 pb-12">
              {/* Header */}
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="h1">
                    Dashboard
                  </h1>
                  <p className="text-green-600 text-xl font-medium">
                    Welcome back, User! Here is your recycling overview.
                  </p>
                </div>
              </header>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Personal Score */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <MdEco className="text-2xl" />
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                      {userStats.scoreChange}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 text-lg font-medium">Personal Score</p>
                    <h3 className="text-gray-900 text-4xl font-medium mt-1">{userStats.personalScore}</h3>
                  </div>
                </div>

                {/* Total Requests */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <MdListAlt className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-lg font-medium">Total Requests</p>
                    <h3 className="text-gray-900 text-4xl font-medium mt-1">{userStats.totalRequests}</h3>
                  </div>
                </div>

                {/* Items Recycled */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                      <MdCheckCircle className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-lg font-medium">Items Recycled</p>
                    <h3 className="text-gray-900 text-4xl font-medium mt-1">{userStats.itemsRecycled}</h3>
                  </div>
                </div>

                {/* Cancelled */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <MdCancel className="text-2xl" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 text-lg font-medium">Cancelled</p>
                    <h3 className="text-gray-900 text-4xl font-medium mt-1">{userStats.cancelled}</h3>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column - CTA Banner & Recent Requests */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* CTA Banner */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative h-60 bg-gradient-to-r from-green-600 to-emerald-500 flex items-center px-8 py-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                      <div className="relative z-10 flex flex-col gap-4 max-w-lg">
                        <h3 className="text-3xl font-medium text-white">Ready to clear some space?</h3>
                        <p className="text-gray-100 text-lg md:text-xl">
                          Schedule a pickup for your old electronics and boost your eco score today.
                        </p>
                        <Link
                          href='/citizen/book-recycle/new'
                          className="w-fit px-6 py-3 bg-white hover:bg-gray-300 text-green-700 font-medium rounded-lg shadow-lg transition-all flex items-center gap-2">
                          <MdAddCircle className="text-xl" />
                          New Request
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Recent Requests */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="h3">Recent Requests</h3>
                      <Link href="/citizen/book-recycle/requests" className="text-sm font-medium text-green-600 hover:text-green-700">
                        View All
                      </Link>
                    </div>
                    <div className="flex flex-col">
                      {recentRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-4 md:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                              {request.icon}
                            </div>
                            <div>
                              <p className="text-lg font-medium text-gray-900">{request.item}</p>
                              <p className="text-sm text-gray-500">ID: {request.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(request.status)}
                            <p className="text-base md:text-lg text-gray-400 mt-1">{request.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Eco Tip & Nearest Center */}
                <div className="flex flex-col gap-6">
                  {/* Eco Tip */}
                  <div className="bg-green-50 border border-green-200 p-6 rounded-xl flex items-start gap-4">
                    <MdLightbulb className="text-green-600 text-2xl mt-1 flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                      <h4 className="text-lg md:text-xl font-medium text-gray-900">Eco Tip of the Day</h4>
                      <p className="text-base md:text-lg text-green-700 leading-relaxed">
                        {ecoTip}
                      </p>
                    </div>
                  </div>

                  {/* Nearest Center */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                    <h4 className="text-lg md:text-xl font-medium text-gray-900">Nearest Center</h4>
                    <div className="w-full aspect-video bg-gray-200 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                        <MdLocationOn className="text-red-500 text-6xl drop-shadow-md" />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-lg">{nearestCenter.name}</p>
                      <p className="text-gray-500 text-base">
                        {nearestCenter.address}<br />
                        {nearestCenter.city}, {nearestCenter.zipCode}
                      </p>
                    </div>
                    <button className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookRecycle;