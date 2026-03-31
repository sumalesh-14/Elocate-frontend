"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getToken, getUserID } from "@/app/citizen/sign-in/auth";
import {
  Wallet, TrendingUp, Trophy, ArrowUpCircle, ArrowDownCircle,
  ChevronRight, Loader2, X, Medal
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Transaction {
  id: string;
  transactionType: string;
  points: number;
  monetaryAmount: number;
  description: string;
  createdAt: string;
  recycleRequestId: string | null;
}

interface WalletStats {
  totalPoints: number;
  totalMonetaryAmount: number;
  highestSingleTransaction: number;
  totalTransactions: number;
  userRank: number;
  totalUsersRanked: number;
  rankTier: string;
  transactions: Transaction[];
}

const TIER_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PLATINUM: { color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200", label: "Platinum" },
  GOLD:     { color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", label: "Gold" },
  SILVER:   { color: "text-slate-500", bg: "bg-slate-50 border-slate-200", label: "Silver" },
  BRONZE:   { color: "text-orange-600", bg: "bg-orange-50 border-orange-200", label: "Bronze" },
  UNRANKED: { color: "text-gray-400", bg: "bg-gray-50 border-gray-200", label: "Unranked" },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletSidebar({ isOpen, onClose }: Props) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const token = getToken();
    const userId = getUserID();
    if (!token) { setError("Not authenticated"); return; }
    if (!userId) { setError("User ID not found"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/wallet/stats?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load wallet stats");
      setStats(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchStats();
  }, [isOpen, fetchStats]);

  const tier = stats ? (TIER_CONFIG[stats.rankTier] ?? TIER_CONFIG.UNRANKED) : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-600 to-teal-500">
          <div className="flex items-center gap-2 text-white">
            <Wallet size={20} />
            <span className="font-bold text-lg">Wallet & Rewards</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        )}

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {stats && !loading && (
          <div className="flex-1 overflow-y-auto">
            {/* Stats cards */}
            <div className="p-5 grid grid-cols-2 gap-3">
              {/* Total earned */}
              <div className="col-span-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-md">
                <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Earned</p>
                <p className="text-3xl font-extrabold">₹{stats.totalMonetaryAmount.toFixed(2)}</p>
                <p className="text-emerald-100 text-xs mt-1">{stats.totalTransactions} transactions</p>
              </div>

              {/* Highest single */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-amber-600 mb-2">
                  <TrendingUp size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Best Pickup</span>
                </div>
                <p className="text-xl font-bold text-amber-700">₹{stats.highestSingleTransaction.toFixed(2)}</p>
                <p className="text-xs text-amber-500 mt-0.5">single transaction</p>
              </div>

              {/* Rank */}
              <div className={`border rounded-2xl p-4 ${tier?.bg}`}>
                <div className={`flex items-center gap-1.5 mb-2 ${tier?.color}`}>
                  <Trophy size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Rank</span>
                </div>
                <p className={`text-xl font-bold ${tier?.color}`}>
                  {stats.userRank > 0 ? `#${stats.userRank}` : "—"}
                </p>
                <p className={`text-xs mt-0.5 ${tier?.color}`}>
                  of {stats.totalUsersRanked} · {tier?.label}
                </p>
              </div>
            </div>

            {/* Rank tier explanation */}
            <div className="px-5 pb-4">
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${tier?.bg}`}>
                <Medal size={18} className={tier?.color} />
                <div>
                  <p className={`text-sm font-bold ${tier?.color}`}>{tier?.label} Recycler</p>
                  <p className="text-xs text-gray-500">
                    {stats.rankTier === "PLATINUM" && "Top 5% — you're an eco champion!"}
                    {stats.rankTier === "GOLD" && "Top 20% — keep it up!"}
                    {stats.rankTier === "SILVER" && "Top 50% — great progress!"}
                    {stats.rankTier === "BRONZE" && "Getting started — every device counts!"}
                    {stats.rankTier === "UNRANKED" && "Complete your first recycling to get ranked!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="px-5 pb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <ChevronRight size={14} className="text-emerald-500" />
                Transaction History
              </h3>

              {stats.transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No transactions yet. Book your first recycling pickup!
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                        ${tx.transactionType === "CREDIT" ? "bg-emerald-100" : "bg-red-100"}`}>
                        {tx.transactionType === "CREDIT"
                          ? <ArrowUpCircle size={18} className="text-emerald-600" />
                          : <ArrowDownCircle size={18} className="text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{tx.description}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${tx.transactionType === "CREDIT" ? "text-emerald-600" : "text-red-500"}`}>
                          {tx.transactionType === "CREDIT" ? "+" : "-"}₹{tx.monetaryAmount?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
