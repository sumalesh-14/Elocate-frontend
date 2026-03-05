"use client";
import React from "react";
import Link from "next/link";
import {
  MdEco,
  MdListAlt,
  MdCheckCircle,
  MdCancel,
  MdLaptopMac,
  MdSmartphone,
  MdPrint,
  MdLightbulb,
  MdLocationOn,
  MdAddCircle,
} from "react-icons/md";
import { getUserName } from "../sign-in/auth";

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
  const name = getUserName() || "User";

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
      icon: <MdLaptopMac className="text-xl" />,
      status: "completed",
      date: "Oct 24, 2026",
    },
    {
      id: "#REQ-8822",
      item: "iPhone 11 - Broken",
      icon: <MdSmartphone className="text-xl" />,
      status: "pending",
      date: "Nov 02, 2026",
    },
    {
      id: "#REQ-8819",
      item: "Canon Printer",
      icon: <MdPrint className="text-xl" />,
      status: "cancelled",
      date: "Oct 15, 2026",
    },
  ];

  const nearestCenter: NearestCenter = {
    name: "Main Office HQ",
    address: "123 Green Valley Rd, Tech Park",
    city: "San Francisco",
    zipCode: "CA 94103",
    mapImage: "/api/placeholder/400/300",
  };

  const ecoTip =
    "Before recycling your phone, ensure all data is wiped. We perform a secondary wipe, but safety first!";

  const getStatusBadge = (status: RecycleRequest["status"]) => {
    const statusStyles: Record<string, string> = {
      completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      cancelled: "bg-red-50 text-red-700 border border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${statusStyles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const statCards = [
    {
      label: "Personal Score",
      value: userStats.personalScore,
      badge: userStats.scoreChange,
      icon: <MdEco className="text-xl" />,
      iconBg: "bg-gradient-to-br from-tech-lime to-emerald-400",
      iconText: "text-eco-900",
    },
    {
      label: "Total Requests",
      value: userStats.totalRequests,
      icon: <MdListAlt className="text-xl" />,
      iconBg: "bg-gradient-to-br from-sky-400 to-blue-500",
      iconText: "text-white",
    },
    {
      label: "Items Recycled",
      value: userStats.itemsRecycled,
      icon: <MdCheckCircle className="text-xl" />,
      iconBg: "bg-gradient-to-br from-teal-400 to-emerald-500",
      iconText: "text-white",
    },
    {
      label: "Cancelled",
      value: userStats.cancelled,
      icon: <MdCancel className="text-xl" />,
      iconBg: "bg-gradient-to-br from-red-400 to-rose-500",
      iconText: "text-white",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 pb-12">

      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-eco-900 tracking-tight">Dashboard</h1>
          <p className="text-eco-600 mt-0.5 text-sm">
            Welcome back, <span className="font-semibold text-eco-800">{name}</span>! Here is your recycling overview.
          </p>
        </div>
        <Link
          href="/citizen/book-recycle/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-tech-lime to-emerald-400 text-eco-900 font-semibold rounded-xl shadow-md hover:shadow-lg hover:brightness-105 transition-all text-sm"
        >
          <MdAddCircle className="text-lg" />
          New Request
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} ${card.iconText} shadow-sm`}>
                {card.icon}
              </div>
              {card.badge && (
                <span className="bg-eco-50 text-eco-700 border border-eco-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {card.badge}
                </span>
              )}
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{card.label}</p>
              <h3 className="text-gray-900 text-3xl font-bold mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* CTA Banner */}
          <div className="rounded-2xl overflow-hidden shadow-md">
            <div className="relative h-52 bg-gradient-to-r from-eco-950 via-eco-900 to-emerald-800 flex items-center px-8 py-8">
              {/* Decorative circles */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-tech-lime/10 blur-2xl" />
              <div className="absolute right-16 bottom-4 w-24 h-24 rounded-full bg-emerald-400/10 blur-xl" />

              <div className="relative z-10 flex flex-col gap-4 max-w-lg">
                <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-bold text-tech-lime uppercase tracking-widest bg-tech-lime/10 border border-tech-lime/20 px-3 py-1 rounded-full">
                  <MdEco /> Ready to recycle?
                </span>
                <h3 className="text-2xl font-bold text-white leading-snug">
                  Schedule a pickup & boost your eco score today.
                </h3>
                <Link
                  href="/citizen/book-recycle/new"
                  className="w-fit flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-tech-lime to-emerald-400 text-eco-900 font-semibold rounded-xl shadow-lg hover:brightness-105 transition-all text-sm"
                >
                  <MdAddCircle className="text-base" />
                  Book a Pickup
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-eco-900">Recent Requests</h3>
              <Link
                href="/citizen/book-recycle/requests"
                className="text-xs font-semibold text-eco-600 hover:text-eco-800 transition-colors bg-eco-50 px-3 py-1.5 rounded-lg"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-eco-50 border border-eco-100 flex items-center justify-center text-eco-700">
                      {request.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{request.item}</p>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {request.id}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {getStatusBadge(request.status)}
                    <p className="text-xs text-gray-400">{request.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">

          {/* Eco Tip */}
          <div className="bg-gradient-to-br from-eco-950 to-eco-900 rounded-2xl p-5 flex items-start gap-4 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-tech-lime/15 border border-tech-lime/20 flex items-center justify-center text-tech-lime flex-shrink-0 mt-0.5">
              <MdLightbulb className="text-xl" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-tech-lime mb-1.5 uppercase tracking-wide">Eco Tip of the Day</h4>
              <p className="text-sm text-eco-300 leading-relaxed">{ecoTip}</p>
            </div>
          </div>

          {/* Nearest Center */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-eco-900">Nearest Center</h4>
              <span className="text-[10px] font-bold uppercase tracking-widest text-eco-400 bg-eco-50 px-2 py-1 rounded-full">Live</span>
            </div>

            {/* Map placeholder */}
            <div className="w-full aspect-video bg-eco-950 rounded-xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-eco-900 to-eco-950" />
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "linear-gradient(to right, #a8e063 1px, transparent 1px), linear-gradient(to bottom, #a8e063 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              />
              <MdLocationOn className="relative z-10 text-red-400 text-5xl drop-shadow-lg" />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">{nearestCenter.name}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {nearestCenter.address}<br />
                {nearestCenter.city}, {nearestCenter.zipCode}
              </p>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-eco-950 hover:bg-eco-900 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <MdLocationOn className="text-tech-lime text-base" />
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRecycle;