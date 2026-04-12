'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Recycle, Clock, Building2, MessageSquare, CheckCircle2, AlertCircle, IndianRupee, RefreshCw } from 'lucide-react';
import { reportsApi, adminFacilitiesApi, adminRecycleRequestApi, contactIssuesApi } from '@/lib/admin-api';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; icon: React.ElementType; color: string; loading?: boolean }> = ({ label, value, sub, icon: Icon, color, loading }) => (
    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}><Icon size={22} /></div>
        </div>
        {loading ? <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mb-1" /> : <div className="text-3xl font-display font-bold text-eco-900">{value}</div>}
        {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
        <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</div>
    </div>
);

const StatusBar: React.FC<{ label: string; count: number; total: number; color: string }> = ({ label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-bold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const FacilityMap: React.FC<{ facilities: any[]; requests: any[] }> = ({ facilities, requests }) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapVisible, setMapVisible] = useState(false);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setMapVisible(true); observer.disconnect(); } },
            { threshold: 0, rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!mapVisible || !token || !containerRef.current || mapRef.current) return;

        mapboxgl.accessToken = token;

        const first = facilities.find((f: any) => (f.lat || f.latitude) && (f.lon || f.longitude));
        const center: [number, number] = first
            ? [+(first.lon ?? first.longitude), +(first.lat ?? first.latitude)]
            : [78.9629, 20.5937];

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center,
            zoom: first ? 10 : 4.5,
        });
        mapRef.current = map;
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 11, duration: 1500 }),
                () => {}
            );
        }

        map.on('load', () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            facilities.forEach((f: any) => {
                const lat = +(f.latitude ?? f.lat ?? 0);
                const lon = +(f.longitude ?? f.lon ?? 0);
                if (!lat || !lon) return;

                const fReqs = requests.filter((r: any) => r.facilityId === f.id || r.facilityName === f.name);
                const recycled = fReqs.filter((r: any) => r.status === 'RECYCLED').length;
                const pending = fReqs.filter((r: any) => ['CREATED', 'APPROVED'].includes(r.status)).length;
                const revenue = fReqs.reduce((s: number, r: any) => s + (r.finalAmount || r.estimatedAmount || 0), 0);
                const color = f.verified ? '#10b981' : '#f59e0b';

                const dot = document.createElement('div');
                dot.style.cssText = `display:flex;flex-direction:column;align-items:center;cursor:pointer;`;
                dot.innerHTML = `
                    <div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);flex-shrink:0;"></div>
                    <div style="margin-top:2px;background:white;border:1px solid #e5e7eb;border-radius:4px;padding:1px 4px;font-size:9px;font-weight:700;color:#1f2937;white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 3px rgba(0,0,0,0.1);pointer-events:none;line-height:1.4;">${f.name.length > 16 ? f.name.substring(0, 16) + '…' : f.name}</div>
                `;

                const popup = new mapboxgl.Popup({ offset: 16, maxWidth: '240px' }).setHTML(`
                    <div style="font-family:sans-serif;padding:4px">
                        <div style="font-weight:700;font-size:13px;color:#064e3b;margin-bottom:4px">${f.name}</div>
                        <div style="font-size:11px;color:#6b7280;margin-bottom:8px">${f.address || ''}</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center">
                            <div style="background:#f0fdf4;border-radius:8px;padding:6px">
                                <div style="font-size:16px;font-weight:800;color:#059669">${recycled}</div>
                                <div style="font-size:9px;color:#6b7280;text-transform:uppercase">Recycled</div>
                            </div>
                            <div style="background:#fffbeb;border-radius:8px;padding:6px">
                                <div style="font-size:16px;font-weight:800;color:#d97706">${pending}</div>
                                <div style="font-size:9px;color:#6b7280;text-transform:uppercase">Pending</div>
                            </div>
                            <div style="background:#f0f9ff;border-radius:8px;padding:6px">
                                <div style="font-size:13px;font-weight:800;color:#0369a1">₹${revenue}</div>
                                <div style="font-size:9px;color:#6b7280;text-transform:uppercase">Revenue</div>
                            </div>
                        </div>
                        <div style="margin-top:8px;font-size:10px;padding:3px 8px;border-radius:20px;display:inline-block;background:${f.verified ? '#d1fae5' : '#fef3c7'};color:${f.verified ? '#065f46' : '#92400e'};font-weight:600">
                            ${f.verified ? '✓ Verified' : '⏳ Pending'}
                        </div>
                    </div>
                `);
                const marker = new mapboxgl.Marker({ element: dot, anchor: 'top' }).setLngLat([lon, lat]).setPopup(popup).addTo(map);
                markersRef.current.push(marker);
            });
        });

        return () => { map.remove(); mapRef.current = null; };
    }, [mapVisible, facilities, requests]);

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden" ref={wrapperRef}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-display font-bold text-xl text-eco-900">Facility Network Map</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Click markers to see recycled / pending / revenue per facility</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Verified</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Pending</span>
                </div>
            </div>
            <div style={{ position: 'relative', height: '420px', width: '100%' }}>
                {!mapVisible && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', zIndex: 1 }}>
                        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</div>
                            <div style={{ fontSize: '0.9rem' }}>Map loading...</div>
                        </div>
                    </div>
                )}
                <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
            </div>
        </div>
    );
};

export const DashboardHome: React.FC = () => {
    const [overview, setOverview] = useState<any>(null);
    const [financials, setFinancials] = useState<any>(null);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [openIssues, setOpenIssues] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [mapLoading, setMapLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    useEffect(() => { setLastRefresh(new Date()); }, []);

    const FACILITY_CACHE_KEY = 'admin_facilities_cache';
    const FACILITY_CACHE_TTL = 5 * 60 * 1000;

    const getCachedFacilities = (): any[] | null => {
        try {
            const raw = sessionStorage.getItem(FACILITY_CACHE_KEY);
            if (!raw) return null;
            const { data, ts } = JSON.parse(raw);
            if (Date.now() - ts > FACILITY_CACHE_TTL) { sessionStorage.removeItem(FACILITY_CACHE_KEY); return null; }
            return data;
        } catch { return null; }
    };

    const setCachedFacilities = (data: any[]) => {
        try { sessionStorage.setItem(FACILITY_CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
    };

    // Load stats, requests, issues — runs on mount
    const load = async (bustCache = false) => {
        setLoading(true);
        try {
            const [ovRes, finRes, reqRes, issRes] = await Promise.allSettled([
                reportsApi.getOverview(),
                reportsApi.getFinancials(),
                adminRecycleRequestApi.getAll(),
                contactIssuesApi.getAll({ status: 'OPEN', size: 1 }),
            ]);
            if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data);
            if (finRes.status === 'fulfilled') setFinancials(finRes.value.data);
            if (reqRes.status === 'fulfilled') setRequests(Array.isArray(reqRes.value.data) ? reqRes.value.data : reqRes.value.data?.content || []);
            if (issRes.status === 'fulfilled') setOpenIssues(issRes.value.data?.totalElements ?? issRes.value.data?.length ?? 0);
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    };

    // Load facilities for map — only when user clicks
    const loadMap = async () => {
        setMapLoading(true);
        try {
            const cached = getCachedFacilities();
            if (cached) {
                setFacilities(cached);
            } else {
                const res = await adminFacilitiesApi.getAll({ size: 500, page: 0 });
                const facs = res.data?.content || [];
                setFacilities(facs);
                setCachedFacilities(facs);
            }
            setMapLoaded(true);
        } finally {
            setMapLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const totalRequests = requests.length;
    const recycled = requests.filter(r => r.status === 'RECYCLED').length;
    const pending = requests.filter(r => ['CREATED', 'APPROVED'].includes(r.status)).length;
    const totalFacilities = facilities.length;
    const pendingApprovals = facilities.filter(f => !f.verified).length;
    const totalRevenue = financials?.aggregates?.totalPayouts ?? financials?.aggregates?.totalVolume ?? 0;
    const statusCounts = {
        CREATED: requests.filter(r => r.status === 'CREATED').length,
        APPROVED: requests.filter(r => r.status === 'APPROVED').length,
        VERIFIED: requests.filter(r => r.status === 'VERIFIED').length,
        RECYCLED: recycled,
        REJECTED: requests.filter(r => r.status === 'REJECTED').length,
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-eco-950">Dashboard Overview</h2>
                    <p className="text-eco-600 mt-1 text-sm">{lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}</p>
                </div>
                <button onClick={() => load()} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-eco-900 text-white rounded-lg text-sm font-medium shadow-lg hover:bg-eco-800 transition-colors disabled:opacity-60">
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard label="Total Requests" value={totalRequests} icon={Recycle} color="bg-blue-50 text-blue-600" loading={loading} />
                <StatCard label="Recycled" value={recycled} sub="completed" icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" loading={loading} />
                <StatCard label="Pending" value={pending} sub="needs action" icon={Clock} color="bg-amber-50 text-amber-600" loading={loading} />
                <StatCard label="Facilities" value={totalFacilities} sub={`${pendingApprovals} pending approval`} icon={Building2} color="bg-violet-50 text-violet-600" loading={loading} />
                <StatCard label="Revenue" value={`₹${totalRevenue}`} icon={IndianRupee} color="bg-teal-50 text-teal-600" loading={loading} />
                <StatCard label="Open Issues" value={openIssues} icon={MessageSquare} color="bg-rose-50 text-rose-600" loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                    <h3 className="font-display font-bold text-lg text-eco-900 mb-6">Request Status Breakdown</h3>
                    <div className="space-y-4">
                        <StatusBar label="Created" count={statusCounts.CREATED} total={totalRequests} color="bg-blue-400" />
                        <StatusBar label="Approved" count={statusCounts.APPROVED} total={totalRequests} color="bg-violet-400" />
                        <StatusBar label="Verified" count={statusCounts.VERIFIED} total={totalRequests} color="bg-teal-400" />
                        <StatusBar label="Recycled" count={statusCounts.RECYCLED} total={totalRequests} color="bg-emerald-500" />
                        <StatusBar label="Rejected" count={statusCounts.REJECTED} total={totalRequests} color="bg-red-400" />
                    </div>
                    {financials?.aggregates && (
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Financials</h4>
                            {[
                                { label: 'Total Estimated', value: financials.aggregates.totalVolume ?? '—' },
                                { label: 'Total Paid Out', value: financials.aggregates.totalPayouts ?? '—' },
                                { label: 'Avg Per Request', value: financials.aggregates.avgPerRequest ?? '—' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between text-sm">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span className="font-bold text-gray-800">₹{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-display font-bold text-lg text-eco-900">Recent Requests</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/60">
                                <tr>{['ID', 'Citizen', 'Device', 'Status', 'Amount'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                                )) : requests.slice(0, 6).map((r: any) => {
                                    const sc: Record<string, string> = { RECYCLED: 'bg-emerald-100 text-emerald-700', APPROVED: 'bg-violet-100 text-violet-700', CREATED: 'bg-blue-100 text-blue-700', REJECTED: 'bg-red-100 text-red-700', VERIFIED: 'bg-teal-100 text-teal-700' };
                                    return (
                                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-mono font-bold text-xs text-eco-800">{r.requestNumber || r.id?.substring(0, 8).toUpperCase()}</td>
                                            <td className="px-4 py-3 text-gray-700 truncate max-w-[100px]">{r.citizenName || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 truncate max-w-[120px]">{[r.brandName, r.deviceModelName].filter(Boolean).join(' ') || '—'}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${sc[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
                                            <td className="px-4 py-3 font-bold text-gray-800">{r.finalAmount != null ? `₹${r.finalAmount}` : r.estimatedAmount != null ? `~₹${r.estimatedAmount}` : '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Map — load on demand */}
            {!mapLoaded ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-display font-bold text-xl text-eco-900">Facility Network Map</h3>
                            <p className="text-sm text-gray-400 mt-0.5">Click to load facility locations and stats</p>
                        </div>
                    </div>
                    <div style={{ height: '420px' }} className="flex flex-col items-center justify-center gap-4 bg-gray-50">
                        <div className="text-4xl">🗺️</div>
                        <p className="text-gray-400 text-sm">Map not loaded — fetches up to 500 facilities</p>
                        <button onClick={loadMap} disabled={mapLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-eco-900 text-white rounded-xl font-bold hover:bg-eco-800 transition-colors disabled:opacity-60 shadow-lg">
                            {mapLoading ? <><RefreshCw size={16} className="animate-spin" /> Loading...</> : 'Load Map'}
                        </button>
                    </div>
                </div>
            ) : (
                <FacilityMap facilities={facilities} requests={requests} />
            )}

            {pendingApprovals > 0 && (
                <div className="bg-white rounded-[2rem] border border-amber-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-amber-100 flex items-center gap-3">
                        <AlertCircle size={18} className="text-amber-500" />
                        <h3 className="font-display font-bold text-lg text-eco-900">{pendingApprovals} Facilities Awaiting Approval</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {facilities.filter(f => !f.verified).slice(0, 5).map((f: any) => (
                            <div key={f.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div>
                                    <div className="font-semibold text-gray-800">{f.name}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{f.address}</div>
                                </div>
                                <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-100">Pending</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
