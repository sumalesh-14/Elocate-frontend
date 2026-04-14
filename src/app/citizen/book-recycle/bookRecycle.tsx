"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Recycle, CheckCircle2, IndianRupee, Clock, Plus,
    Laptop, Smartphone, Printer, Tv, Headphones, HardDrive,
    Lightbulb, MapPin, TrendingUp, ArrowRight
} from "lucide-react";
import { getUserName, getUserID } from "../sign-in/auth";
import { recycleRequestApi, userProfileApi } from "@/lib/admin-api";
import { fetchFacilities } from "@/lib/utils/facilityApi";
import { RecycleRequestApiResponse, mapApiResponseToRequest, Request } from "./requests/types";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const ECO_TIPS = [
    "Before recycling your phone, wipe all personal data. We do a secondary wipe, but safety first!",
    "E-waste contains gold, silver, and copper — recycling 1 million phones recovers ~35kg of gold.",
    "Never throw batteries in regular trash. They contain toxic chemicals that contaminate soil.",
    "Laptops can be refurbished and donated to schools — ask us about our refurbishment program.",
    "Recycling one tonne of e-waste saves more energy than mining the equivalent raw materials.",
];

const getDeviceIcon = (cat: string) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("laptop") || c.includes("computer")) return <Laptop size={18} />;
    if (c.includes("phone") || c.includes("mobile")) return <Smartphone size={18} />;
    if (c.includes("print")) return <Printer size={18} />;
    if (c.includes("tv") || c.includes("tele")) return <Tv size={18} />;
    if (c.includes("audio") || c.includes("head")) return <Headphones size={18} />;
    return <HardDrive size={18} />;
};

const statusConfig: Record<string, { label: string; cls: string }> = {
    pending:    { label: "Pending",     cls: "bg-amber-100 text-amber-700" },
    confirmed:  { label: "Confirmed",   cls: "bg-blue-100 text-blue-700" },
    "in-progress": { label: "In Progress", cls: "bg-violet-100 text-violet-700" },
    completed:  { label: "Completed",   cls: "bg-emerald-100 text-emerald-700" },
    cancelled:  { label: "Cancelled",   cls: "bg-red-100 text-red-700" },
};

// Mini bar chart — last 6 months request counts
const ActivityChart: React.FC<{ requests: Request[] }> = ({ requests }) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
            label: d.toLocaleString("default", { month: "short" }),
            month: d.getMonth(),
            year: d.getFullYear(),
            total: 0,
            recycled: 0,
            pending: 0,
        };
    });

    requests.forEach(r => {
        const d = new Date(r.requestDate);
        const m = months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
        if (!m) return;
        m.total++;
        if (r.status === "completed") m.recycled++;
        else if (["pending", "confirmed", "in-progress"].includes(r.status)) m.pending++;
    });

    const max = Math.max(...months.map(m => m.total), 1);

    return (
        <div className="flex items-end gap-3 h-40 w-full">
            {months.map((m, i) => {
                const pct = (m.total / max) * 100;
                const isHov = hovered === i;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative group"
                        onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                        {/* Tooltip */}
                        {isHov && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-eco-950 text-white text-[10px] rounded-xl px-3 py-2 shadow-xl z-10 whitespace-nowrap pointer-events-none">
                                <div className="font-bold text-xs mb-1">{m.label}</div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Recycled: <span className="font-bold">{m.recycled}</span></div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Pending: <span className="font-bold">{m.pending}</span></div>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Total: <span className="font-bold">{m.total}</span></div>
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-eco-950" />
                            </div>
                        )}
                        {/* Bar */}
                        <div className="w-full rounded-t-lg overflow-hidden transition-all duration-300"
                            style={{ height: "112px", background: isHov ? "#d1fae5" : "#ecfdf5" }}>
                            <div className="w-full rounded-t-lg transition-all duration-500"
                                style={{
                                    height: `${pct}%`,
                                    marginTop: `${100 - pct}%`,
                                    background: isHov
                                        ? "linear-gradient(to top, #059669, #34d399)"
                                        : "linear-gradient(to top, #10b981, #6ee7b7)",
                                }} />
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{m.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

// Nearest facility map
const NearestFacilityMap: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [facility, setFacility] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
            if (!token || !containerRef.current) return;

            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                const result = await fetchFacilities(lat, lon, 100, 0, 1, true);
                const nearest = result.content[0];
                setFacility(nearest || null);
                setLoading(false);

                mapboxgl.accessToken = token;
                const map = new mapboxgl.Map({
                    container: containerRef.current!,
                    style: "mapbox://styles/mapbox/light-v11",
                    center: nearest ? [nearest.lon, nearest.lat] : [lon, lat],
                    zoom: 12,
                    interactive: false,
                });
                mapRef.current = map;

                map.on("load", () => {
                    // User marker
                    const userEl = document.createElement("div");
                    userEl.style.cssText = "width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);";
                    new mapboxgl.Marker(userEl).setLngLat([lon, lat]).addTo(map);

                    if (nearest) {
                        const facEl = document.createElement("div");
                        facEl.style.cssText = "width:14px;height:14px;border-radius:50%;background:#10b981;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);";
                        new mapboxgl.Marker(facEl).setLngLat([nearest.lon, nearest.lat]).addTo(map);
                    }
                });
            }, () => {
                setLoading(false);
            });
        };
        init();
        return () => { mapRef.current?.remove(); mapRef.current = null; };
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h4 className="font-bold text-eco-900 flex items-center gap-2"><MapPin size={16} className="text-emerald-500" /> Nearest Center</h4>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Live
                </span>
            </div>
            <div ref={containerRef} style={{ height: "160px", width: "100%" }}>
                {loading && (
                    <div className="h-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                        Detecting location...
                    </div>
                )}
            </div>
            {facility ? (
                <div className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{facility.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{facility.address}</p>
                    <a href={`https://maps.google.com/?q=${facility.lat},${facility.lon}`} target="_blank" rel="noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-eco-950 hover:bg-eco-900 text-white rounded-xl text-xs font-semibold transition-colors">
                        <MapPin size={13} className="text-tech-lime" /> Get Directions
                    </a>
                </div>
            ) : !loading && (
                <div className="px-5 py-4 text-xs text-gray-400 text-center">Enable location to find nearest center</div>
            )}
        </div>
    );
};

const BookRecycle = () => {
    const name = getUserName() || "User";
    const [requests, setRequests] = useState<Request[]>([]);
    const [allRequests, setAllRequests] = useState<RecycleRequestApiResponse[]>([]);
    const [wallet, setWallet] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const tipIndex = new Date().getDate() % ECO_TIPS.length;

    useEffect(() => {
        const load = async () => {
            const userId = getUserID();
            if (!userId) { setLoading(false); return; }
            try {
                const [reqRes, profileRes] = await Promise.allSettled([
                    recycleRequestApi.getByUserId(userId),
                    userProfileApi.get(),
                ]);
                if (reqRes.status === "fulfilled") {
                    const raw: RecycleRequestApiResponse[] = reqRes.value.data || [];
                    setAllRequests(raw);
                    setRequests(Array.isArray(raw) ? raw.map(mapApiResponseToRequest) : []);
                }
                if (profileRes.status === "fulfilled") {
                    const d = profileRes.value.data;
                    setWallet(d?.wallet?.pointsBalance ?? d?.wallet?.balance ?? null);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const recycled = requests.filter(r => r.status === "completed").length;
    const pending = requests.filter(r => ["pending", "confirmed", "in-progress"].includes(r.status)).length;
    const cancelled = requests.filter(r => r.status === "cancelled").length;
    const totalEarned = allRequests.reduce((sum, r) => sum + (r.finalAmount || 0), 0);
    const recent = requests.slice(0, 5);

    const StatCard = ({ icon, label, value, color, sub }: any) => (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5">
                    {loading ? <span className="inline-block w-10 h-7 bg-gray-100 rounded animate-pulse" /> : value}
                </p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col gap-6 pb-12">

            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-emerald-600 font-medium mt-0.5">Welcome back, {name}!</p>
                </div>
                <Link href="/citizen/book-recycle/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-eco-900 text-white font-semibold rounded-xl shadow-md hover:bg-eco-800 transition-all text-sm">
                    <Plus size={16} /> New Request
                </Link>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600"><Recycle size={20} /></div>
                    <div><p className="text-gray-500 text-sm font-medium">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900 mt-0.5">{loading ? <span className="inline-block w-10 h-7 bg-blue-100 rounded animate-pulse" /> : requests.length}</p>
                    <p className="text-xs text-gray-400 mt-0.5">all time</p></div>
                </div>
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600"><CheckCircle2 size={20} /></div>
                    <div><p className="text-gray-500 text-sm font-medium">Recycled</p>
                    <p className="text-3xl font-bold text-gray-900 mt-0.5">{loading ? <span className="inline-block w-10 h-7 bg-emerald-100 rounded animate-pulse" /> : recycled}</p>
                    <p className="text-xs text-gray-400 mt-0.5">completed</p></div>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600"><Clock size={20} /></div>
                    <div><p className="text-gray-500 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold text-gray-900 mt-0.5">{loading ? <span className="inline-block w-10 h-7 bg-amber-100 rounded animate-pulse" /> : pending}</p>
                    <p className="text-xs text-gray-400 mt-0.5">in progress</p></div>
                </div>
                <div className="bg-violet-50 rounded-2xl border border-violet-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100 text-violet-600"><IndianRupee size={20} /></div>
                    <div><p className="text-gray-500 text-sm font-medium">Total Earned</p>
                    <p className="text-3xl font-bold text-gray-900 mt-0.5">{loading ? <span className="inline-block w-10 h-7 bg-violet-100 rounded animate-pulse" /> : `₹${totalEarned}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">from recycling</p></div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left — 2/3 */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Recent Requests */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Recent Requests</h3>
                            <Link href="/citizen/book-recycle/requests"
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                View All <ArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {loading ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100" />
                                        <div className="space-y-1.5">
                                            <div className="h-3.5 bg-gray-100 rounded w-32" />
                                            <div className="h-3 bg-gray-100 rounded w-20" />
                                        </div>
                                    </div>
                                    <div className="h-6 bg-gray-100 rounded w-20" />
                                </div>
                            )) : recent.length === 0 ? (
                                <div className="px-6 py-10 text-center text-gray-400 text-sm">
                                    No requests yet. <Link href="/citizen/book-recycle/new" className="text-emerald-600 font-medium">Create your first one →</Link>
                                </div>
                            ) : recent.map(r => {
                                const sc = statusConfig[r.status] || { label: r.status, cls: "bg-gray-100 text-gray-600" };
                                return (
                                    <div key={r.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                {getDeviceIcon(r.categoryName)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{r.deviceBrand} {r.deviceModel}</p>
                                                <p className="text-xs text-gray-400">{r.categoryName} · {r.requestDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${sc.cls}`}>{sc.label}</span>
                                            {(r.estimatedAmount || r.finalAmount) && (
                                                <span className="text-xs text-gray-400">₹{r.finalAmount ?? r.estimatedAmount}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity Chart */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Recycling Activity</h3>
                            <span className="text-xs text-gray-400">Last 6 months</span>
                        </div>
                        {loading
                            ? <div className="h-40 bg-gray-50 rounded-lg animate-pulse" />
                            : <ActivityChart requests={requests} />
                        }
                    </div>

                    {/* E-Waste Awareness Video */}
                    {(() => {
                        const VideoSection = () => {
                            const wrapperRef = React.useRef<HTMLDivElement>(null);
                            const [src, setSrc] = React.useState("https://www.youtube.com/embed/MQLadfsvfLo?si=FcBVA2a0JREOBX1r");
                            React.useEffect(() => {
                                const observer = new IntersectionObserver(
                                    ([entry]) => {
                                        if (entry.isIntersecting) {
                                            setSrc("https://www.youtube.com/embed/MQLadfsvfLo?si=FcBVA2a0JREOBX1r&autoplay=1&mute=1");
                                            observer.disconnect();
                                        }
                                    },
                                    { threshold: 0.5 }
                                );
                                if (wrapperRef.current) observer.observe(wrapperRef.current);
                                return () => observer.disconnect();
                            }, []);
                            return (
                                <div ref={wrapperRef} className="relative w-full" style={{ paddingBottom: "40%" }}>
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={src}
                                        title="YouTube video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    />
                                </div>
                            );
                        };
                        return (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                            <span className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[7px] border-t-transparent border-b-transparent border-l-white ml-0.5" />
                                        </span>
                                        E-Waste Awareness
                                    </h3>
                                    <span className="text-xs text-gray-400">Why recycling matters</span>
                                </div>
                                <VideoSection />
                                <div className="px-6 py-4 bg-emerald-50/50 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Every year, 50+ million tonnes of e-waste is generated globally. Proper recycling recovers precious metals and prevents toxic chemicals from entering our environment.
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Right — 1/3 */}
                <div className="flex flex-col gap-5">

                    {/* Wallet Card */}
                    <div className="bg-gradient-to-br from-eco-900 to-emerald-800 rounded-2xl p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">My Wallet</span>
                            <ArrowRight size={18} className="text-emerald-300" />
                        </div>
                        <p className="text-3xl font-bold">{wallet !== null ? `₹${wallet}` : "—"}</p>
                        <p className="text-xs text-emerald-300 mt-1">Available balance</p>
                        <Link href="/citizen/book-recycle/wallet"
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-colors border border-white/10">
                            View Wallet <ArrowRight size={12} />
                        </Link>
                    </div>

                    {/* Eco Tip */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                            <Lightbulb size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Eco Tip of the Day</p>
                            <p className="text-sm text-emerald-800 leading-relaxed">{ECO_TIPS[tipIndex]}</p>
                        </div>
                    </div>

                    {/* Nearest Facility Map */}
                    <NearestFacilityMap />

                    {/* Upcoming Pickup */}
                    {(() => {
                        const next = requests.find(r => ["pending", "confirmed"].includes(r.status) && r.pickupDate);
                        if (!next) return null;
                        const daysLeft = next.pickupDate ? Math.ceil((new Date(next.pickupDate).getTime() - Date.now()) / 86400000) : null;
                        return (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <Clock size={12} className="text-amber-500" /> Upcoming Pickup
                                </p>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        {getDeviceIcon(next.categoryName)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{next.deviceBrand} {next.deviceModel}</p>
                                        <p className="text-xs text-gray-400">{next.categoryName}</p>
                                    </div>
                                </div>
                                {next.pickupDate && (
                                    <div className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2">
                                        <span className="text-xs text-amber-700 font-medium">{new Date(next.pickupDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        {daysLeft !== null && daysLeft >= 0 && (
                                            <span className="text-xs font-bold text-amber-600">{daysLeft === 0 ? "Today!" : `${daysLeft}d away`}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* Last Recycled Device */}
                    {(() => {
                        const last = requests.find(r => r.status === "completed");
                        if (!last) return null;
                        return (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <CheckCircle2 size={12} className="text-emerald-500" /> Last Recycled
                                </p>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        {getDeviceIcon(last.categoryName)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{last.deviceBrand} {last.deviceModel}</p>
                                        <p className="text-xs text-gray-400">{last.requestDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    {last.finalAmount && <span className="text-sm font-bold text-emerald-600">+₹{last.finalAmount} earned</span>}
                                    {last.certificateUrl && (
                                        <a href={last.certificateUrl} target="_blank" rel="noreferrer"
                                            className="text-xs font-semibold text-eco-700 hover:text-eco-900 flex items-center gap-1">
                                            Certificate <ArrowRight size={11} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Environmental Impact */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-4">🌍 Your Impact</p>
                        <div className="space-y-3">
                            {[
                                { label: "CO₂ Saved", value: `~${(recycled * 2.1).toFixed(1)} kg`, sub: "estimated" },
                                { label: "Devices Diverted", value: recycled, sub: "from landfill" },
                                { label: "Materials Recovered", value: `~${(recycled * 0.3).toFixed(1)} kg`, sub: "metals & plastics" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700">{s.label}</p>
                                        <p className="text-[10px] text-gray-400">{s.sub}</p>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-700">{loading ? "—" : s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Share Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Share Your Journey</p>
                        <p className="text-sm text-gray-600 mb-4">I've recycled <span className="font-bold text-emerald-600">{recycled} device{recycled !== 1 ? "s" : ""}</span> with ELocate. Join me in making e-waste history!</p>
                        <div className="flex gap-2">
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I've recycled ${recycled} device${recycled !== 1 ? "s" : ""} with ELocate! Join me in making e-waste history 🌱 #ELocate #EWaste`)}`}
                                target="_blank" rel="noreferrer"
                                className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl text-xs font-bold text-center transition-colors border border-sky-100">
                                𝕏 Tweet
                            </a>
                            <a href={`https://wa.me/?text=${encodeURIComponent(`I've recycled ${recycled} device${recycled !== 1 ? "s" : ""} with ELocate! Join me 🌱 https://elocate-ewaste.vercel.app`)}`}
                                target="_blank" rel="noreferrer"
                                className="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-xs font-bold text-center transition-colors border border-green-100">
                                WhatsApp
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookRecycle;
