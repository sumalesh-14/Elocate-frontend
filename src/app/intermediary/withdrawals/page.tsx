"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getToken } from "../sign-in/auth";
import {
  CheckCircle2, XCircle, Loader2, Banknote, Clock,
  User, Building2, Eye, EyeOff, Copy, Check
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Withdrawal {
  id: string;
  amount: number;
  accountHolderName: string;
  maskedAccountNumber: string;
  fullAccountNumber: string;
  bankName: string;
  ifscCode: string;
  mobileNumber: string;
  upiId: string | null;
  email: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  requestedAt: string;
  citizenName: string | null;
  citizenEmail: string | null;
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [showAcct, setShowAcct] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopy();

  const fetchPending = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/intermediary/withdrawals/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      setWithdrawals(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const act = async (id: string, action: "approve" | "reject") => {
    const token = getToken();
    setActionLoading(id + action);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/intermediary/withdrawals/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: noteMap[id] || null }),
      });
      if (!res.ok) throw new Error("Action failed");
      await fetchPending();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const CopyBtn = ({ value, id }: { value: string; id: string }) => (
    <button onClick={() => copy(value, id)} title="Copy"
      className="ml-1 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-eco-600 transition-colors">
      {copied === id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-eco-900">Withdrawal Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and process citizen payout requests</p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
          {withdrawals.length} pending
        </span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-eco-500" size={32} />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <Banknote size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No pending withdrawal requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map(w => {
            const acctVisible = showAcct[w.id];
            return (
              <div key={w.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Clock size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-gray-900 text-lg">₹{Number(w.amount).toFixed(2)}</p>
                        <CopyBtn value={String(w.amount)} id={w.id + "-amt"} />
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(w.requestedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full">PENDING</span>
                </div>

                {/* Details grid */}
                <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-5">

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><User size={11} />Citizen</p>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-800">{w.citizenName || "—"}</span>
                      {w.citizenName && <CopyBtn value={w.citizenName} id={w.id + "-cname"} />}
                    </div>
                    {w.citizenEmail && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400">{w.citizenEmail}</span>
                        <CopyBtn value={w.citizenEmail} id={w.id + "-cemail"} />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Building2 size={11} />Bank</p>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-800">{w.bankName}</span>
                      <CopyBtn value={w.bankName} id={w.id + "-bank"} />
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400">{w.ifscCode}</span>
                      <CopyBtn value={w.ifscCode} id={w.id + "-ifsc"} />
                    </div>
                  </div>

                  {/* Account number with eye + copy */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1"><Banknote size={11} />Account No.</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-800 font-mono">
                        {acctVisible ? w.fullAccountNumber : w.maskedAccountNumber}
                      </span>
                      <button
                        onClick={() => setShowAcct(s => ({ ...s, [w.id]: !s[w.id] }))}
                        title={acctVisible ? "Hide" : "Reveal"}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-eco-600 transition-colors"
                      >
                        {acctVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <CopyBtn value={w.fullAccountNumber} id={w.id + "-acct"} />
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400">{w.accountHolderName}</span>
                      <CopyBtn value={w.accountHolderName} id={w.id + "-holder"} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile</p>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-800">{w.mobileNumber}</span>
                      <CopyBtn value={w.mobileNumber} id={w.id + "-mob"} />
                    </div>
                  </div>

                  {w.upiId && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">UPI ID</p>
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-800">{w.upiId}</span>
                        <CopyBtn value={w.upiId} id={w.id + "-upi"} />
                      </div>
                    </div>
                  )}

                  {w.email && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-gray-800">{w.email}</span>
                        <CopyBtn value={w.email} id={w.id + "-email"} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Note + actions */}
                <div className="px-6 pb-5 pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    value={noteMap[w.id] || ""}
                    onChange={e => setNoteMap(m => ({ ...m, [w.id]: e.target.value }))}
                    placeholder="Add a note (optional for approve, recommended for reject)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-eco-400 bg-gray-50"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => act(w.id, "reject")} disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition-colors disabled:opacity-50">
                      {actionLoading === w.id + "reject" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Reject
                    </button>
                    <button onClick={() => act(w.id, "approve")} disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-eco-600 hover:bg-eco-700 text-white font-semibold text-sm transition-colors disabled:opacity-50">
                      {actionLoading === w.id + "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
