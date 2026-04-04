"use client";
import { useEffect, useState } from "react";
import { getToken, getUserID } from "@/app/citizen/sign-in/auth";
import {
  Wallet, TrendingUp, Trophy, Recycle, ArrowDownCircle,
  Medal, Loader2, Banknote, Clock, RefreshCw
} from "lucide-react";
import WithdrawModal from "./WithdrawModal";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Transaction {
  id: string;
  transactionType: string; // RECYCLED | WITHDRAWN | REFUNDED
  amount: number;
  description: string;
  recycleRequestNumber: string | null;
  createdAt: string;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  bankName: string;
  maskedAccountNumber: string;
  adminNote: string | null;
  requestedAt: string;
  processedAt: string | null;
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
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [tab, setTab] = useState<"credits" | "debits">("credits");

  const fetchStats = async () => {
    const token = getToken();
    const userId = getUserID();
    if (!token || !userId) { setError("Not authenticated"); setLoading(false); return; }
    setLoading(true);
    try {
      const [statsRes, wdRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/wallet/stats?userId=${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/v1/citizen/withdrawal`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!statsRes.ok) throw new Error("Failed to load wallet stats");
      setStats(await statsRes.json());
      if (wdRes.ok) setWithdrawals(await wdRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    const userId = getUserID();
    if (!token || !userId) { setError("Not authenticated"); setLoading(false); return; }

    Promise.all([
      fetch(`${BASE_URL}/api/v1/wallet/stats?userId=${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/api/v1/citizen/withdrawal`, { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([statsRes, wdRes]) => {
      if (cancelled) return;
      if (!statsRes.ok) throw new Error("Failed to load wallet stats");
      setStats(await statsRes.json());
      if (wdRes.ok) setWithdrawals(await wdRes.json());
    }).catch(e => {
      if (!cancelled) setError(e.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-emerald-500" size={36} />
    </div>
  );
  if (error) return <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600">{error}</div>;
  if (!stats) return null;

  const tier = TIER_CONFIG[stats.rankTier] ?? TIER_CONFIG.UNRANKED;
  const recycledTxs = stats.transactions.filter(t => t.transactionType === "RECYCLED");
  const debitTxs = stats.transactions.filter(t => t.transactionType === "WITHDRAWN" || t.transactionType === "REFUNDED");

  return (
    <div className="w-full space-y-6">

      {/* Title + Withdraw button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Wallet size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Wallet</h1>
            <p className="text-sm text-gray-500">Your recycling earnings & rewards</p>
          </div>
        </div>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm shadow-sm transition"
        >
          <Banknote size={16} /> Withdraw
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">Available Balance</p>
          <p className="text-4xl font-extrabold">₹{(+stats.totalAmount || 0).toFixed(2)}</p>
          <p className="text-emerald-100 text-sm mt-1">{recycledTxs.length} recycling rewards</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-3">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Best Pickup</span>
          </div>
          <p className="text-3xl font-extrabold text-amber-700">₹{(+stats.highestSingleAmount || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">highest single recycling</p>
        </div>
        <div className={`${tier.bg} border ${tier.border} rounded-2xl p-6 shadow-sm`}>
          <div className={`flex items-center gap-2 mb-3 ${tier.color}`}>
            <Trophy size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Your Rank</span>
          </div>
          <p className={`text-3xl font-extrabold ${tier.color}`}>{stats.userRank > 0 ? `#${stats.userRank}` : "—"}</p>
          <p className={`text-xs mt-1 ${tier.color}`}>of {stats.totalUsersRanked} recyclers</p>
        </div>
      </div>

      {/* Rank tier badge */}
      <div className={`flex items-center gap-4 p-5 rounded-2xl border ${tier.bg} ${tier.border}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.bg} border ${tier.border}`}>
          <Medal size={24} className={tier.color} />
        </div>
        <div className="flex-1">
          <p className={`text-base font-bold ${tier.color}`}>{tier.label} Recycler</p>
          <p className="text-sm text-gray-500">{tier.desc}</p>
        </div>
        <div className="hidden sm:block w-40">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Rank {stats.userRank}</span>
            <span>{stats.totalUsersRanked} total</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: stats.totalUsersRanked > 0 ? `${Math.max(5, 100 - (stats.userRank / stats.totalUsersRanked) * 100)}%` : "0%" }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab("credits")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
              ${tab === "credits" ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Recycle size={16} /> Recycling Credits
            <span className={`text-xs px-2 py-0.5 rounded-full ${tab === "credits" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {recycledTxs.length}
            </span>
          </button>
          <button
            onClick={() => setTab("debits")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
              ${tab === "debits" ? "text-red-600 border-b-2 border-red-400 bg-red-50/50" : "text-gray-500 hover:text-gray-700"}`}
          >
            <ArrowDownCircle size={16} /> Withdrawals
            <span className={`text-xs px-2 py-0.5 rounded-full ${tab === "debits" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
              {debitTxs.length + withdrawals.filter(w => w.status === "PENDING").length}
            </span>
          </button>
        </div>

        {/* Credits tab */}
        {tab === "credits" && (
          recycledTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Recycle size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No recycling rewards yet. Book your first pickup!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recycledTxs.map(tx => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Recycle size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{tx.description}</p>
                    {tx.recycleRequestNumber && (
                      <p className="text-xs text-emerald-600 font-mono mt-0.5">{tx.recycleRequestNumber}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-emerald-600">+₹{(+tx.amount || 0).toFixed(2)}</p>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">RECYCLED</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Debits tab */}
        {tab === "debits" && (
          <div className="divide-y divide-gray-50">
            {/* Pending withdrawals */}
            {withdrawals.filter(w => w.status === "PENDING").map(w => (
              <div key={w.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{w.bankName} · {w.maskedAccountNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Requested {new Date(w.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-amber-600">-₹{(+w.amount).toFixed(2)}</p>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">PENDING</span>
                </div>
              </div>
            ))}
            {/* Completed withdrawal transactions */}
            {debitTxs.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${tx.transactionType === "WITHDRAWN" ? "bg-red-100" : "bg-emerald-100"}`}>
                  {tx.transactionType === "WITHDRAWN"
                    ? <ArrowDownCircle size={18} className="text-red-500" />
                    : <RefreshCw size={18} className="text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-base font-bold ${tx.transactionType === "WITHDRAWN" ? "text-red-500" : "text-emerald-600"}`}>
                    {tx.transactionType === "WITHDRAWN" ? "-" : "+"}₹{(+tx.amount || 0).toFixed(2)}
                  </p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full
                    ${tx.transactionType === "WITHDRAWN" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                    {tx.transactionType}
                  </span>
                </div>
              </div>
            ))}
            {debitTxs.length === 0 && withdrawals.filter(w => w.status === "PENDING").length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Banknote size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No withdrawals yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {withdrawOpen && (
        <WithdrawModal
          availableBalance={+stats.totalAmount || 0}
          onClose={() => setWithdrawOpen(false)}
          onSuccess={() => { setLoading(true); fetchStats(); }}
        />
      )}
    </div>
  );
}
