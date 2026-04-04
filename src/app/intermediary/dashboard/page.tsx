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

  const QUOTES = [
    "“Sustainability is no longer about doing less harm. It's about doing more good.”",
    "“Your facility has diverted over 2.4 tonnes of e-waste from landfills this month alone.”",
    "“Great work! You're in the top 15% of fastest collectors in your region.”",
    "“Recycling one million laptops saves energy equivalent to the electricity used by 3,657 US homes in a year.”",
    "“Small steps make a huge impact. Every device recycled is a win for the planet.”"
  ];
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const STATS = [
    { label: "Total Requests",   value: dash.totalRequests,    unit: "all time",    icon: Package,      cardBg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/60", color: "bg-emerald-100 text-emerald-700" },
    { label: "Pending Approval", value: dash.pendingRequests,  unit: "need action", icon: Clock,        cardBg: "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/60",     color: "bg-amber-100 text-amber-700" },
    { label: "Completed",        value: dash.completedRequests,unit: "recycled",    icon: CheckCircle2, cardBg: "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60",         color: "bg-blue-100 text-blue-700" },
    { label: "Total Credited",   value: fmt(dash.totalCredited || 0), unit: "to citizens", icon: Banknote, cardBg: "bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200/60", color: "bg-violet-100 text-violet-700" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-8 relative w-full">
      {/* ── Background ambient glow ── */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {STATS.map((s, i) => (
          <div key={i} className={`group relative ${s.cardBg} backdrop-blur-xl border rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden`}>
            <div className="absolute -inset-1 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-2xl ${s.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}><s.icon size={22} /></div>
            </div>
            <div className="relative z-10">
              <p className="text-3xl font-black text-gray-900 drop-shadow-sm">{s.value}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">{s.unit}</p>
              <p className="text-sm font-bold text-gray-800 mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gamification + Quick Actions + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

        {/* Facility Score */}
        <div className={`bg-gradient-to-br from-emerald-100/90 via-emerald-50/80 to-white backdrop-blur-xl border border-emerald-200/50 rounded-3xl p-6 flex flex-col gap-4 shadow-xl shadow-emerald-100/50 hover:shadow-2xl transition-all duration-500 group`}>
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
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl p-3.5 text-center shadow-sm group-hover:-translate-y-1 transition-transform duration-500">
              <p className="text-xl font-black text-gray-900 drop-shadow-sm">{dash.completedRequests}</p>
              <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mt-0.5">Completed</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl p-3.5 text-center shadow-sm group-hover:-translate-y-1 transition-transform duration-500 delay-75">
              <p className="text-xl font-black text-gray-900 drop-shadow-sm">{dash.pendingRequests}</p>
              <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mt-0.5">Pending</p>
            </div>
          </div>

          {/* Animated Quote Carousel */}
          <div className="flex-1 mt-5 min-h-[6rem] relative w-full flex items-center justify-center bg-white/40 rounded-[20px] p-5 overflow-hidden shadow-inner border border-white/50">
            {QUOTES.map((q, i) => (
              <p key={i} className={`absolute w-full px-6 text-[13px] leading-relaxed font-bold text-emerald-900 text-center transition-all duration-700 ease-in-out ${i === quoteIdx ? "opacity-100 translate-y-0" : i < quoteIdx ? "opacity-0 -translate-y-6" : "opacity-0 translate-y-6"}`}>
                {q}
              </p>
            ))}
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
                className="bg-gradient-to-br from-emerald-50/50 to-white hover:from-emerald-100/50 rounded-[20px] flex flex-col items-center justify-center p-6 shadow-sm border border-emerald-100/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <a.icon size={20} />
                </div>
                <span className="text-[13px] font-extrabold text-gray-800 text-center leading-tight">{a.label}</span>
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
              <div key={i} className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-white hover:from-emerald-50/50 rounded-[20px] p-4 shadow-sm border border-slate-100 hover:shadow-emerald-50/50 transition-all duration-300 group cursor-default">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Activity size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-800 truncate">
                    {tx.citizenName ? <><strong>{tx.citizenName}</strong> — </> : ""}{tx.description}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider mt-0.5">{timeAgo(tx.createdAt)}</p>
                </div>
                {tx.amount > 0 ? (
                  <span className="text-sm font-extrabold text-emerald-600 flex-shrink-0">+₹{(+tx.amount).toFixed(0)}</span>
                ) : (
                  <ChevronRight size={14} className="text-gray-300 flex-shrink-0 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative z-10 transition-all duration-500 hover:shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
          <h3 className="text-lg font-bold text-gray-900">Recent Requests</h3>
          <a href="/intermediary/collections" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ChevronRight size={14} />
          </a>
        </div>
        {requests.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-12">No requests yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100/50">
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
