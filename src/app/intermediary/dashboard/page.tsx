"use client";
import { useState, useEffect } from "react";
import { getToken, getUserID, getFullName } from "../sign-in/auth";
import {
  Package, Clock, CheckCircle2, Banknote, ArrowUp, ArrowDown,
  CalendarClock, Truck, Settings, Trophy, TrendingUp,
  Star, ChevronRight, Activity, Loader2, XCircle,
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardData {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalCredited: number;
  facilityId: string;
  facilityName: string;
  isVerified: boolean;
}

interface Request {
  id: string;
  requestNumber: string;
  citizenName?: string;
  deviceName?: string;
  status: string;
  estimatedAmount?: number;
  finalAmount?: number;
  createdAt: string;
}

interface WalletTx {
  id: string;
  transactionType: string;
  amount: number;
  description: string;
  citizenName?: string;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  CREATED:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-indigo-100 text-indigo-700",
  RECYCLED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED:"bg-gray-100 text-gray-500",
};

function getTier(rate: number) {
  if (rate >= 95) return { label: "Platinum", color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-200",   stars: 4 };
  if (rate >= 80) return { label: "Gold",     color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", stars: 3 };
  if (rate >= 60) return { label: "Silver",   color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-200",  stars: 2 };
  return               { label: "Bronze",   color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", stars: 1 };
}

function RadialProgress({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#16a34a" strokeWidth={8}
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ - dash}
        strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n/1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IntermediaryDashboard() {
  const name = getFullName() || "Partner";
  const userId = getUserID();

  const [dash, setDash]       = useState<DashboardData | null>(null);
  const [requests, setReqs]   = useState<Request[]>([]);
  const [feed, setFeed]       = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setError("Not authenticated"); setLoading(false); return; }
    let cancelled = false;

    Promise.all([
      fetch(`${BASE}/api/v1/partner-auth/dashboard`, { headers: authHeaders() }),
      fetch(`${BASE}/api/v1/intermediary/recycle-requests?userId=${userId}`, { headers: authHeaders() }),
    ]).then(async ([dRes, rRes]) => {
      if (cancelled) return;
      if (!dRes.ok) throw new Error("Failed to load dashboard");
      const d: DashboardData = await dRes.json();
      setDash(d);

      if (rRes.ok) {
        const all: Request[] = await rRes.json();
        setReqs(all.slice(0, 5));
      }

      // Fetch wallet feed using facilityId from dashboard
      if (d.facilityId) {
        const txRes = await fetch(`${BASE}/api/v1/wallet/transactions/facility?facilityId=${d.facilityId}`, { headers: authHeaders() });
        if (!cancelled && txRes.ok) {
          const txs: WalletTx[] = await txRes.json();
          setFeed(txs.slice(0, 5));
        }
      }
    }).catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-emerald-500" size={36} />
    </div>
  );
  if (error) return (
    <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
      <XCircle size={18} /> {error}
    </div>
  );
  if (!dash) return null;

  const completionRate = dash.totalRequests > 0
    ? Math.round((dash.completedRequests / dash.totalRequests) * 100)
    : 0;
  const tier = getTier(completionRate);
  const nextTierAt = tier.label === "Bronze" ? 60 : tier.label === "Silver" ? 80 : tier.label === "Gold" ? 95 : 100;
  const progressToNext = tier.label === "Platinum" ? 100
    : Math.max(0, Math.round(((completionRate - (nextTierAt - 20)) / 20) * 100));

  const STATS = [
    { label: "Total Requests",   value: dash.totalRequests,    unit: "all time",    icon: Package,      cardBg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/60", color: "bg-emerald-100 text-emerald-700" },
    { label: "Pending Approval", value: dash.pendingRequests,  unit: "need action", icon: Clock,        cardBg: "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/60",     color: "bg-amber-100 text-amber-700" },
    { label: "Completed",        value: dash.completedRequests,unit: "recycled",    icon: CheckCircle2, cardBg: "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60",         color: "bg-blue-100 text-blue-700" },
    { label: "Total Credited",   value: fmt(dash.totalCredited || 0), unit: "to citizens", icon: Banknote, cardBg: "bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200/60", color: "bg-violet-100 text-violet-700" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-8 w-full">

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm font-medium whitespace-nowrap">
            Welcome back, <strong className="text-gray-900">{name}</strong> — here's your facility overview.
          </p>
          {dash.isVerified && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-1">
              ✓ Verified Facility
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <a href="/intermediary/schedule" className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">View Schedule</a>
          <a href="/intermediary/collections" className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-emerald-800 transition">All Collections</a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div key={i} className={`${s.cardBg} border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">{s.unit}</p>
            <p className="text-sm font-bold text-gray-700 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gamification + Quick Actions + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Facility Score */}
        <div className={`${tier.bg} border ${tier.border} rounded-2xl p-6 flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className={tier.color} />
              <span className={`text-sm font-bold ${tier.color}`}>Facility Score</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.border} ${tier.color}`}>{tier.label}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative">
              <RadialProgress pct={completionRate} size={88} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold text-gray-900">{completionRate}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Completion Rate</p>
              <div className="flex gap-0.5 mb-2">
                {Array.from({length:4}).map((_,i) => (
                  <Star key={i} size={14} className={i < tier.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {tier.label === "Platinum" ? "Max tier reached!" : `${nextTierAt - completionRate}% to ${tier.label === "Bronze" ? "Silver" : tier.label === "Silver" ? "Gold" : "Platinum"}`}
              </p>
            </div>
          </div>
          {tier.label !== "Platinum" && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress to next tier</span><span className="text-emerald-600 font-semibold">{progressToNext}%</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{width:`${progressToNext}%`}} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">{dash.completedRequests}</p>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Completed</p>
            </div>
            <div className="bg-white/70 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">{dash.pendingRequests}</p>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Pending</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { label: "Schedule Pickup",  href: "/intermediary/schedule",       icon: CalendarClock },
              { label: "Assign Driver",    href: "/intermediary/assign-drivers", icon: Truck },
              { label: "Withdrawals",      href: "/intermediary/withdrawals",    icon: Banknote },
              { label: "Transactions",     href: "/intermediary/transactions",   icon: TrendingUp },
              { label: "Collections",      href: "/intermediary/collections",    icon: Package },
              { label: "Settings",         href: "/intermediary/settings",       icon: Settings },
            ].map((a, i) => (
              <a key={i} href={a.href}
                className="bg-white hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-2xl flex flex-col items-center justify-center p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <a.icon size={18} />
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">{a.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Activity Feed</p>
          <div className="space-y-2.5">
            {feed.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">No recent activity</div>
            ) : feed.map((tx, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 hover:bg-emerald-50/50 hover:border-emerald-100 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Activity size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {tx.citizenName ? <><strong>{tx.citizenName}</strong> — </> : ""}{tx.description}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wide mt-0.5">{timeAgo(tx.createdAt)}</p>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 flex-shrink-0">+₹{(+tx.amount).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Recent Requests</h3>
          <a href="/intermediary/collections" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ChevronRight size={14} />
          </a>
        </div>
        {requests.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-12">No requests yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/60">
                <tr>
                  {["Request #", "Device", "Status", "Amount", "Date"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-emerald-700">{r.requestNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.deviceName || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      {r.finalAmount ? `₹${r.finalAmount}` : r.estimatedAmount ? `₹${r.estimatedAmount}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
