"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getToken, getUserID } from "@/app/citizen/sign-in/auth";
import {
  Wallet, TrendingUp, Trophy, ArrowUpCircle, ArrowDownCircle,
  Medal, Loader2
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  description: string;
  recycleRequestNumber: string | null;
  createdAt: string;
}

interface WalletStats {
  totalAmount: number;
  highestSingleAmount: number;
  totalTransactions: number;
  userRank: number;
  totalUsersRanked: number;
  rankTier: string;
  transactions: Transaction[];
}

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; desc: string }> = {
  PLATINUM: { color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", label: "Platinum", desc: "Top 5% — you're an eco champion!" },
  GOLD:     { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", label: "Gold", desc: "Top 20% — keep it up!" },
  SILVER:   { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Silver", desc: "Top 50% — great progress!" },
  BRONZE:   { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", label: "Bronze", desc: "Getting started — every device counts!" },
  UNRANKED: { color: "text-gray-400", bg: "bg-gray-50", border: "border-gray-200", label: "Unranked", desc: "Complete your first recycling to get ranked!" },
};

export default function WalletPage() {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const token = getToken();
    const userId = getUserID();
    if (!token || !userId) { setError("Not authenticated"); setLoading(false); return; }
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

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-emerald-500" size={36} />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600">{error}</div>
  );

  if (!stats) return null;

  const tier = TIER_CONFIG[stats.rankTier] ?? TIER_CONFIG.UNRANKED;

  return (
    <div className="w-full space-y-6">

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Wallet size={20} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Wallet</h1>
          <p className="text-sm text-gray-500">Your recycling earnings & rewards</p>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total earned */}
        <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Earned</p>
          <p className="text-4xl font-extrabold">₹{(+stats.totalAmount || 0).toFixed(2)}</p>
          <p className="text-emerald-100 text-sm mt-1">{stats.totalTransactions} transactions completed</p>
        </div>

        {/* Best pickup */}
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-3">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Best Pickup</span>
          </div>
          <p className="text-3xl font-extrabold text-amber-700">₹{(+stats.highestSingleAmount || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">highest single transaction</p>
        </div>

        {/* Rank */}
        <div className={`${tier.bg} border ${tier.border} rounded-2xl p-6 shadow-sm`}>
          <div className={`flex items-center gap-2 mb-3 ${tier.color}`}>
            <Trophy size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Your Rank</span>
          </div>
          <p className={`text-3xl font-extrabold ${tier.color}`}>
            {stats.userRank > 0 ? `#${stats.userRank}` : "—"}
          </p>
          <p className={`text-xs mt-1 ${tier.color}`}>of {stats.totalUsersRanked} recyclers</p>
        </div>
      </div>

      {/* Rank tier badge */}
      <div className={`flex items-center gap-4 p-5 rounded-2xl border ${tier.bg} ${tier.border}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.bg} border ${tier.border}`}>
          <Medal size={24} className={tier.color} />
        </div>
        <div>
          <p className={`text-base font-bold ${tier.color}`}>{tier.label} Recycler</p>
          <p className="text-sm text-gray-500">{tier.desc}</p>
        </div>
        {/* Tier progress bar */}
        <div className="ml-auto hidden sm:block w-40">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Rank {stats.userRank}</span>
            <span>{stats.totalUsersRanked} total</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: stats.totalUsersRanked > 0 ? `${Math.max(5, 100 - (stats.userRank / stats.totalUsersRanked) * 100)}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Transaction History</h2>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {stats.totalTransactions} total
          </span>
        </div>

        {stats.transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Wallet size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No transactions yet. Book your first recycling pickup!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${tx.transactionType === "CREDIT" ? "bg-emerald-100" : "bg-red-100"}`}>
                  {tx.transactionType === "CREDIT"
                    ? <ArrowUpCircle size={20} className="text-emerald-600" />
                    : <ArrowDownCircle size={20} className="text-red-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{tx.description}</p>
                  {tx.recycleRequestNumber && (
                    <p className="text-xs text-emerald-600 font-mono mt-0.5">{tx.recycleRequestNumber}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-bold ${tx.transactionType === "CREDIT" ? "text-emerald-600" : "text-red-500"}`}>
                    {tx.transactionType === "CREDIT" ? "+" : "-"}₹{(+tx.amount || 0).toFixed(2)}
                  </p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full
                    ${tx.transactionType === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {tx.transactionType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
