'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Mail, Ban, CheckCircle, MapPin, Send, X, Eye, Edit2, Save, ChevronRight, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { adminCitizensApi } from '@/lib/admin-api';

interface Citizen {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    joinDate: string;
    status: 'Active' | 'Suspended';
}

const mapUser = (item: any): Citizen => ({
    id: item.user?.id || item.id || '',
    name: item.user?.fullName || item.fullName || '—',
    email: item.user?.email || item.email || '—',
    phone: item.user?.mobileNumber || item.mobileNumber || '—',
    location: item.address?.city ? `${item.address.city}, ${item.address.state || ''}`.trim().replace(/,$/, '') : '—',
    joinDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
    status: item.status === 'ACTIVE' || item.isActive === true ? 'Active' : 'Suspended',
});

export const CitizenManagement: React.FC = () => {
    const { showToast } = useToast();
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Suspended'>('All');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 20;

    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isEditingCitizen, setIsEditingCitizen] = useState(false);

    const fetchCitizens = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, size: pageSize };
            if (searchTerm) params.search = searchTerm;
            if (filterStatus !== 'All') params.isActive = filterStatus === 'Active';
            const res = await adminCitizensApi.getAll(params);
            const data = res.data;
            const content = data?.content || data || [];
            setCitizens(Array.isArray(content) ? content.map(mapUser) : []);
            setTotalPages(data?.totalPages ?? 1);
            setTotalElements(data?.totalElements ?? content.length);
        } catch {
            showToast('Failed to load citizens', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filterStatus]);

    useEffect(() => { fetchCitizens(); }, [fetchCitizens]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setPage(0); }, 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const handleStatusToggle = async (citizen: Citizen) => {
        const newActive = citizen.status === 'Suspended';
        if (!newActive && !window.confirm(`Suspend ${citizen.name}?`)) return;
        try {
            await adminCitizensApi.toggleActive(citizen.id, newActive);
            showToast(`${citizen.name} ${newActive ? 'activated' : 'suspended'}.`, newActive ? 'success' : 'info');
            fetchCitizens();
        } catch {
            showToast('Failed to update status', 'error');
        }
    };

    const handleExportCSV = () => {
        if (citizens.length === 0) { showToast('No data to export', 'error'); return; }
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Join Date', 'Status'];
        const csv = [headers.join(','), ...citizens.map(c => [c.id, `"${c.name}"`, c.email, c.phone, `"${c.location}"`, c.joinDate, c.status].join(','))].join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        link.download = `citizens_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showToast('Exported successfully!');
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-eco-950">Citizen Management</h2>
                    <p className="text-eco-600 mt-1">Manage registered users and handle account status.</p>
                </div>
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <input type="text" placeholder="Search by name, email, phone..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tech-lime text-gray-900 placeholder-gray-500" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium min-w-[140px] justify-between">
                        <span className="flex items-center gap-2"><Filter size={16} /> {filterStatus}</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 p-1 hidden group-hover:block z-20">
                        {(['All', 'Active', 'Suspended'] as const).map(s => (
                            <button key={s} onClick={() => { setFilterStatus(s); setPage(0); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterStatus === s ? 'bg-eco-50 text-eco-800 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                {['User', 'Phone', 'Location', 'Joined', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading citizens...
                                </td></tr>
                            ) : citizens.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">No citizens found.</td></tr>
                            ) : citizens.map(c => (
                                <tr key={c.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-eco-900">{c.name}</div>
                                                <div className="text-xs text-gray-500">{c.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{c.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 flex items-center gap-1.5">
                                            <MapPin size={14} className="text-gray-400" />{c.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{c.joinDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            {c.status === 'Active' ? <CheckCircle size={12} className="mr-1" /> : <Ban size={12} className="mr-1" />}
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedCitizen(c); setIsEditingCitizen(false); setShowDetailsModal(true); }} className="p-2 text-eco-600 hover:bg-eco-50 rounded-lg transition-colors" title="View Details"><Eye size={16} /></button>
                                            <button onClick={() => { setSelectedCitizen(c); setShowEmailModal(true); }} className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Send Email"><Mail size={16} /></button>
                                            <button onClick={() => handleStatusToggle(c)} className={`p-2 rounded-lg transition-colors ${c.status === 'Active' ? 'text-gray-500 hover:bg-red-50 hover:text-red-600' : 'text-red-500 hover:bg-green-50 hover:text-green-600'}`} title={c.status === 'Active' ? 'Suspend' : 'Activate'}>
                                                {c.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-8 py-6 border-t border-gray-100 flex items-center justify-between rounded-b-[2rem]">
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                        Showing {citizens.length} of {totalElements} citizens
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 transition-all">
                            <ChevronRight size={20} className="rotate-180" />
                        </button>
                        <span className="text-sm font-medium text-gray-600 px-2">Page {page + 1} of {Math.max(1, totalPages)}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                            className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedCitizen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 md:left-80 bg-black/30" onClick={() => setShowDetailsModal(false)} />
                    <div className="relative w-full max-w-lg md:ml-80 bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden animate-fade-in-up">
                        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-display font-bold text-eco-900">Citizen Details</h3>
                                <p className="text-sm text-gray-500 mt-1 font-mono">{selectedCitizen.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsEditingCitizen(!isEditingCitizen)} className={`p-2 rounded-full transition-colors ${isEditingCitizen ? 'bg-blue-100 text-blue-600' : 'text-blue-600 hover:bg-blue-50'}`}><Edit2 size={18} /></button>
                                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
                            </div>
                        </div>
                        <div className="p-8 space-y-4">
                            {[
                                { label: 'Full Name', key: 'name', type: 'text' },
                                { label: 'Email', key: 'email', type: 'email' },
                                { label: 'Phone', key: 'phone', type: 'text' },
                                { label: 'Location', key: 'location', type: 'text' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{f.label}</label>
                                    <input type={f.type} value={(selectedCitizen as any)[f.key]} disabled={!isEditingCitizen}
                                        onChange={e => setSelectedCitizen({ ...selectedCitizen, [f.key]: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Joined</label>
                                <input type="text" value={selectedCitizen.joinDate} disabled className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && selectedCitizen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 md:left-80 bg-black/30" onClick={() => setShowEmailModal(false)} />
                    <div className="relative w-full max-w-lg md:ml-80 bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-eco-900 flex items-center gap-2"><Mail size={18} className="text-eco-600" /> Message {selectedCitizen.name}</h3>
                            <button onClick={() => setShowEmailModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient</label>
                                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">{selectedCitizen.name} &lt;{selectedCitizen.email}&gt;</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                                <input type="text" defaultValue="Important: Account Update" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Message</label>
                                <textarea rows={5} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-sm resize-none" placeholder="Type your message here..." />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200">Cancel</button>
                            <button onClick={() => { setShowEmailModal(false); showToast(`Email sent to ${selectedCitizen.name}!`); }}
                                className="px-6 py-2 bg-eco-900 text-white rounded-xl text-sm font-medium hover:bg-eco-800 flex items-center gap-2">
                                <Send size={16} /> Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
