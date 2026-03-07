"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MdEco,
  MdListAlt,
  MdCheckCircle,
  MdCancel,
  MdLaptopMac,
  MdSmartphone,
  MdPrint,
  MdTv,
  MdHeadphones,
  MdWatch,
  MdKeyboard,
  MdDevicesOther,
  MdLightbulb,
  MdLocationOn,
  MdAddCircle,
} from "react-icons/md";
import { getUserName, getUserID } from "../sign-in/auth";
import { recycleRequestApi } from "@/lib/admin-api";
import { RecycleRequestApiResponse, mapApiResponseToRequest, Request } from "./requests/types";

interface NearestCenter {
  name: string;
  address: string;
  city: string;
  zipCode: string;
}

const BookRecycle = () => {
  const name = getUserName() || "User";

  const [recentRequests, setRecentRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      const userId = getUserID();
      if (!userId) {
        setLoadingRequests(false);
        return;
      }
      try {
        const response = await recycleRequestApi.getByUserId(userId);
        const apiData: RecycleRequestApiResponse[] = response.data;
        const mapped = Array.isArray(apiData)
          ? apiData.map(mapApiResponseToRequest).slice(0, 3)
          : [];
        setRecentRequests(mapped);
      } catch (err) {
        console.error("Dashboard: failed to fetch recent requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRecent();
  }, []);

  // Compute stats from fetched data
  const stats = {
    totalRequests: recentRequests.length > 0 ? "—" : "0", // full count only on /requests page
    completed: recentRequests.filter((r) => r.status === "completed").length,
    cancelled: recentRequests.filter((r) => r.status === "cancelled").length,
  };

  const nearestCenter: NearestCenter = {
    name: "Main Office HQ",
    address: "123 Green Valley Rd, Tech Park",
    city: "San Francisco",
    zipCode: "CA 94103",
  };

  const ecoTip =
    "Before recycling your phone, ensure all data is wiped. We perform a secondary wipe, but safety first!";

  const getDeviceIcon = (deviceType: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      laptop: <MdLaptopMac className="text-2xl" />,
      smartphone: <MdSmartphone className="text-2xl" />,
      printer: <MdPrint className="text-2xl" />,
      tv: <MdTv className="text-2xl" />,
      headphones: <MdHeadphones className="text-2xl" />,
      smartwatch: <MdWatch className="text-2xl" />,
      keyboard: <MdKeyboard className="text-2xl" />,
      other: <MdDevicesOther className="text-2xl" />,
    };
    return icons[deviceType] || icons.other;
  };

  const getStatusBadge = (status: Request["status"]) => {
    const statusClasses: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-purple-100 text-purple-800",
      confirmed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };



  return (
    <div className="w-full flex flex-col gap-8 pb-12">

      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-green-600 text-xl font-medium">
            Welcome back, {name}! Here is your recycling overview.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Personal Score */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <MdEco className="text-2xl" />
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
              Eco Score
            </span>
          </div>
          <div>
            <p className="text-gray-600 text-lg font-medium">Personal Score</p>
            <h3 className="text-gray-900 text-4xl font-medium mt-1">—</h3>
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
            <p className="text-gray-600 text-lg font-medium">Recent Requests</p>
            <h3 className="text-gray-900 text-4xl font-medium mt-1">
              {loadingRequests ? (
                <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                recentRequests.length
              )}
            </h3>
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
            <h3 className="text-gray-900 text-4xl font-medium mt-1">
              {loadingRequests ? (
                <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                stats.completed
              )}
            </h3>
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
            <h3 className="text-gray-900 text-4xl font-medium mt-1">
              {loadingRequests ? (
                <span className="inline-block w-12 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                stats.cancelled
              )}
            </h3>
          </div>
        </div>
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
                  className="w-fit px-6 py-3 bg-white hover:bg-gray-300 text-green-700 font-medium rounded-lg shadow-lg transition-all flex items-center gap-2"
                >
                  <MdAddCircle className="text-xl" />
                  New Request
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold">Recent Requests</h3>
              <Link
                href="/citizen/book-recycle/requests"
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                View All
              </Link>
            </div>
            <div className="flex flex-col">
              {loadingRequests ? (
                // Skeleton rows
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 md:px-6 border-b border-gray-100 last:border-0 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-6 bg-gray-200 rounded w-20 ml-auto" />
                      <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
                    </div>
                  </div>
                ))
              ) : recentRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MdDevicesOther className="text-4xl mx-auto mb-2" />
                  <p>No requests yet. Create your first one!</p>
                </div>
              ) : (
                recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 md:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                        {getDeviceIcon(request.deviceType)}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {request.deviceBrand} {request.deviceModel}
                        </p>
                        <p className="text-sm text-gray-500">{request.categoryName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.status)}
                      <p className="text-base text-gray-400 mt-1">{request.requestDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">

          {/* Eco Tip */}
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl flex items-start gap-4">
            <MdLightbulb className="text-green-600 text-2xl mt-1 flex-shrink-0" />
            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-medium text-gray-900">Eco Tip of the Day</h4>
              <p className="text-base text-green-700 leading-relaxed">{ecoTip}</p>
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
              <p className="text-gray-900 font-medium text-lg">{nearestCenter.name}</p>
              <p className="text-gray-500 text-base">
                {nearestCenter.address}
                <br />
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