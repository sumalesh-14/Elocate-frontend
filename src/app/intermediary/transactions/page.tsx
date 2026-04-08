"use client";
import { useEffect, useState } from "react";
import { getToken } from "../sign-in/auth";
import { resolveFacilityId } from "@/lib/intermediary-api";
import { Recycle, ArrowDownCircle, Loader2, Receipt, RefreshCw } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Tx {
  id: string;
  transactionType: string;
  amount: number;
  description: string;
  recycleRequestNumber: string | null;
  citizenName: string | null;
  createdAt: string;
}

export default function TransactionsPage() {
  const [recycledTxs, setRecycledTxs] = useState<Tx[]>([]);
  const [withdrawalTxs, setWithdrawalTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"recycling" | "withdrawals">("recycling");

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) { setError("Not authenticated"); setLoading(false); return; }

    resolveFacilityId().then(async fid => {
      if (cancelled) return;
      if (!fid) { setError("Facility ID not found. Please log out and log back in."); setLoading(false); return; }
      try {
        const [recycleRes, withdrawalRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/wallet/transactions/facility?facilityId=${fid}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/v1/wallet/transactions/facility/withdrawals?facilityId=${fid}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (cancelled) return;
        if (!recycleRes.ok) throw new Error("Failed to fetch recycling transactions");
        setRecycledTxs(await recycleRes.json());
        if (withdrawalRes.ok) setWithdrawalTxs(await withdrawalRes.json());
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  const totalRecycled = recycledTxs.reduce((s, t) => s + (+t.amount || 0), 0);
  const totalWithdrawn = withdrawalTxs.filter(t => t.transactionType === "WITHDRAWN").reduce((s, t) => s + (+t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-eco-900">Transaction History</h1>
        <p className="text-sm text-gray-500 mt-0.5">All wallet activity for your facility's citizens</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Recycling Records</p>
            <p className="text-2xl font-extrabold text-gray-900">{recycledTxs.length}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Credited</p>
            <p className="text-2xl font-extrabold text-emerald-700">₹{totalRecycled.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Total Withdrawn</p>
            <p className="text-2xl font-extrabold text-red-600">₹{totalWithdrawn.toFixed(2)}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-eco-500" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button onClick={() => setTab("recycling")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                ${tab === "recycling" ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50" : "text-gray-500 hover:text-gray-700"}`}>
              <Recycle size={16} /> Recycling Records
              <span className={`text-xs px-2 py-0.5 rounded-full ${tab === "recycling" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {recycledTxs.length}
              </span>
            </button>
            <button onClick={() => setTab("withdrawals")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                ${tab === "withdrawals" ? "text-red-600 border-b-2 border-red-400 bg-red-50/50" : "text-gray-500 hover:text-gray-700"}`}>
              <ArrowDownCircle size={16} /> Withdrawal Activity
              <span className={`text-xs px-2 py-0.5 rounded-full ${tab === "withdrawals" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                {withdrawalTxs.length}
              </span>
            </button>
          </div>

          {/* Recycling Records */}
          {tab === "recycling" && (
            recycledTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Receipt size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No recycling transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recycledTxs.map(tx => (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Recycle size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">{tx.citizenName || "Unknown"}</p>
                        {tx.recycleRequestNumber && (
                          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                            {tx.recycleRequestNumber}
                          </span>
                        )}
                      </div>
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

          {/* Withdrawal Activity */}
          {tab === "withdrawals" && (
            withdrawalTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ArrowDownCircle size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No withdrawal activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {withdrawalTxs.map(tx => (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      ${tx.transactionType === "WITHDRAWN" ? "bg-red-100" : "bg-emerald-100"}`}>
                      {tx.transactionType === "WITHDRAWN"
                        ? <ArrowDownCircle size={18} className="text-red-500" />
                        : <RefreshCw size={18} className="text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{tx.citizenName || "Unknown"}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{tx.description}</p>
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
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
