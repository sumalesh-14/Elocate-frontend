"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Search, RefreshCw, ChevronDown, Mail, Phone, Clock, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { contactIssuesApi } from '@/lib/admin-api';

type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

interface Issue {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    status: Status;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
    OPEN:        { label: 'Open',        color: 'bg-red-100 text-red-700 border-red-200',      icon: <AlertCircle size={12} /> },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock size={12} /> },
    RESOLVED:    { label: 'Resolved',    color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 size={12} /> },
    CLOSED:      { label: 'Closed',      color: 'bg-gray-100 text-gray-500 border-gray-200',   icon: <XCircle size={12} /> },
};

export function ContactIssues() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [newStatus, setNewStatus] = useState<Status>('OPEN');
    const [total, setTotal] = useState(0);

    const fetchIssues = useCallback(async () => {
        setLoading(true);
        try {
            const res = await contactIssuesApi.getAll({ search: search || undefined, status: statusFilter || undefined, size: 50 });
            setIssues(res.data.content || []);
            setTotal(res.data.totalElements || 0);
        } catch {
            setIssues([]);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchIssues(); }, [fetchIssues]);

    const openDetail = (issue: Issue) => {
        setSelectedIssue(issue);
        setNewStatus(issue.status);
        setAdminNotes(issue.adminNotes || '');
    };

    const handleUpdate = async () => {
        if (!selectedIssue) return;
        setUpdatingId(selectedIssue.id);
        try {
            await contactIssuesApi.updateStatus(selectedIssue.id, newStatus, adminNotes);
            setSelectedIssue(null);
            fetchIssues();
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-eco-900">Contact Issues</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} total submissions</p>
                </div>
                <button onClick={fetchIssues} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, email or message..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400">
                        <Loader2 size={24} className="animate-spin mr-2" /> Loading...
                    </div>
                ) : issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <MessageSquare size={40} className="mb-3 opacity-30" />
                        <p className="text-sm">No contact issues found</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Message</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {issues.map(issue => {
                                const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.OPEN;
                                return (
                                    <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 text-base">{issue.name}</div>
                                            <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                                                <Mail size={12} /> {issue.email}
                                            </div>
                                            {issue.phone && (
                                                <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                                                    <Phone size={12} /> {issue.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell max-w-xs">
                                            <p className="text-gray-600 text-base truncate">{issue.message}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${cfg.color}`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 hidden lg:table-cell">
                                            {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openDetail(issue)}
                                                className="text-sm font-medium text-eco-600 hover:text-eco-800 transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-2xl">{selectedIssue.name}</h3>
                                    <p className="text-base text-gray-500 mt-1">{selectedIssue.email} {selectedIssue.phone && `· ${selectedIssue.phone}`}</p>
                                </div>
                                <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-1">×</button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                                <p className="text-gray-700 text-base leading-relaxed bg-gray-50 rounded-xl p-5">{selectedIssue.message}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Status</label>
                                <select
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value as Status)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-eco-500/20"
                                >
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                                    Admin Notes / Reply
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    rows={5}
                                    placeholder="Write your reply here..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-eco-500/20 resize-none"
                                />
                                {newStatus === 'RESOLVED' && (
                                    <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                                        ✉️ This note will be emailed to the user as a reply.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="p-8 pt-0 flex gap-3">
                            <button onClick={() => setSelectedIssue(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={!!updatingId}
                                className="flex-1 py-3 bg-eco-600 hover:bg-eco-700 text-white rounded-xl text-base font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {updatingId ? <Loader2 size={14} className="animate-spin" /> : null}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
