'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MoreHorizontal, Mail, Ban, CheckCircle, MapPin,
  Building, Send, X, Download, Eye, Edit2, Save, ShieldCheck,
  AlertCircle, Check, Briefcase, FileText, ChevronRight, Activity, User
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { partnerAuthApi } from '@/lib/partner-auth-api';
import { getToken } from '@/lib/sign-in-auth';

// --- Types ---

interface Partner {
  id: string;
  name: string;
  type: 'Processor' | 'Collector' | 'Refurbisher';
  location: string;
  email: string;
  contactPerson: string;
  status: 'Active' | 'Suspended';
  performance: number; // 0-100
  registrationNumber?: string;
  facilityName?: string;
  address?: string;
  state?: string;
  pincode?: string;
  approvalStatus?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface Application {
  id: string;
  name: string;
  regDate: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string;
  email: string;
  phone: string;
  registrationNumber?: string;
  facilityName?: string;
  address?: string;
  state?: string;
  pincode?: string;
  approvalStatus?: string;
  isVerified?: boolean;
  createdAt?: string;
  remarks?: string;
  documentUrls?: string[];
}

export const PartnerManagement: React.FC = () => {
  const { showToast } = useToast();

  // --- Global State ---
  const [viewMode, setViewMode] = useState<'partners' | 'approvals'>('partners');
  const [loading, setLoading] = useState(false);

  // --- Partners Tab State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Suspended'>('All');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);

  // --- Approvals Tab State ---
  const [approvalTab, setApprovalTab] = useState<'pending' | 'rejected'>('pending');
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // --- Pagination State ---
  const [partnersPage, setPartnersPage] = useState(0);
  const [partnersTotalPages, setPartnersTotalPages] = useState(0);
  const [partnersTotalElements, setPartnersTotalElements] = useState(0);
  const [partnersPageSize] = useState(6);

  const [appsPage, setAppsPage] = useState(0);
  const [appsTotalPages, setAppsTotalPages] = useState(0);
  const [appsTotalElements, setAppsTotalElements] = useState(0);
  const [pendingAppsCount, setPendingAppsCount] = useState(0);
  const [rejectedAppsCount, setRejectedAppsCount] = useState(0);
  const [appsPageSize] = useState(6);

  // --- Modals State ---
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [appToReject, setAppToReject] = useState<string | null>(null);
  const [appToApprove, setAppToApprove] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // --- Load Data on Mount ---
  useEffect(() => {
    loadPartners();
  }, [partnersPage, filterStatus, searchTerm]);

  useEffect(() => {
    loadApplications();
  }, [appsPage, approvalTab]);

  const fetchApplicationCounts = async () => {
    try {
      const [pendingData, rejectedData] = await Promise.all([
        partnerAuthApi.listPartnersByStatus('PENDING', 0, 1),
        partnerAuthApi.listPartnersByStatus('REJECTED', 0, 1)
      ]);
      setPendingAppsCount(pendingData.totalElements || 0);
      setRejectedAppsCount(rejectedData.totalElements || 0);
    } catch (err) {
      console.warn('Failed to fetch application counts:', err);
    }
  };

  useEffect(() => {
    fetchApplicationCounts();
  }, [applications]);

  // --- API Functions ---
  const loadPartners = async () => {
    setLoading(true);
    try {
      // Get auth token
      const token = getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/v1/partners?page=${partnersPage}&size=${partnersPageSize}&isVerified=true${searchTerm ? `&search=${searchTerm}` : ''}${filterStatus !== 'All' ? `&isActive=${filterStatus === 'Active'}` : ''}`, {
        headers,
      });
      const data = await response.json();

      // Transform API data to match UI format
      const transformedPartners: Partner[] = (data.content || []).map((p: any) => ({
        id: p.id,
        name: p.facilityName || p.name || 'Unknown',
        type: 'Processor' as any, // Kept in interface but hidden in UI
        location: `${p.state || ''}, ${p.pincode || ''}`.trim() || p.address || 'Unknown',
        email: p.email || '',
        contactPerson: p.fullName || 'N/A',
        status: p.isActive ? 'Active' : 'Suspended',
        performance: Math.floor(Math.random() * 30) + 70, // Mock performance for now
        registrationNumber: p.registrationNumber,
        facilityName: p.facilityName,
        address: p.address,
        state: p.state,
        pincode: p.pincode,
        approvalStatus: p.approvalStatus,
        isVerified: p.isVerified,
        createdAt: p.createdAt
      }));

      setPartners(transformedPartners);
      setPartnersTotalPages(data.totalPages || 0);
      setPartnersTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load partners:', error);
      showToast('Failed to load partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      // Load applications based on current tab and page
      const status = approvalTab === 'pending' ? 'PENDING' : 'REJECTED';
      const data = await partnerAuthApi.listPartnersByStatus(status, appsPage, appsPageSize);

      // Transform API data to match UI format
      const transformedApps: Application[] = (data.content || []).map((p: any) => ({
        id: p.id,
        name: p.facilityName || p.name || 'Unknown',
        regDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
        city: `${p.state || ''}, ${p.pincode || ''}`.trim() || 'Unknown',
        status: (approvalTab === 'pending' ? 'pending' : 'rejected') as any,
        documents: p.isVerified ? 'Verified' : 'Review Needed',
        email: p.email || '',
        phone: p.mobileNumber || '',
        registrationNumber: p.registrationNumber,
        facilityName: p.facilityName || p.name,
        address: p.address,
        state: p.state,
        pincode: p.pincode,
        approvalStatus: p.approvalStatus,
        isVerified: p.isVerified,
        createdAt: p.createdAt,
        remarks: p.remarks,
        documentUrls: p.documentUrls || (p.documentUrl ? [p.documentUrl] : []),
      }));

      setApplications(transformedApps);
      setAppsTotalPages(data.totalPages || 0);
      setAppsTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load applications:', error);
      showToast('Failed to load applications', 'error');
    }
  };

  // --- Partner Actions ---

  const handlePartnerStatusToggle = async (id: string) => {
    const partner = partners.find(p => p.id === id);
    if (!partner) return;

    try {
      // Toggle status via API
      const newStatus = partner.status === 'Active' ? 'Suspended' : 'Active';

      // Update local state immediately for better UX
      setPartners(partners.map(p =>
        p.id === id ? { ...p, status: newStatus } : p
      ));

      showToast(`Partner ${newStatus === 'Suspended' ? 'suspended' : 'activated'}.`, 'info');

      // Note: You may need to add an API endpoint to toggle partner status
      // For now, this updates the UI only
    } catch (error) {
      console.error('Failed to toggle partner status:', error);
      showToast('Failed to update partner status', 'error');
    }
  };

  const handleOpenPartnerDetails = (partner: Partner) => {
    setSelectedPartner({ ...partner });
    setIsEditing(false);
    setShowDetailsModal(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartner) {
      setPartners(partners.map(p => p.id === selectedPartner.id ? selectedPartner : p));
      showToast('Partner details updated successfully.');
      setIsEditing(false);
    }
  };

  // --- Approval Actions ---

  const handleOpenAppDetails = (app: Application) => {
    setSelectedApp({ ...app });
    setIsEditing(false);
    setShowAppModal(true);
  };

  const handleSaveAppDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedApp) {
      setApplications(applications.map(a => a.id === selectedApp.id ? selectedApp : a));
      setIsEditing(false);
      showToast('Application details updated.', 'success');
    }
  };

  const handleApproveApp = (appId: string) => {
    setAppToApprove(appId);
    setShowApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!appToApprove) return;
    const app = applications.find(a => a.id === appToApprove);
    if (!app) return;

    try {
      setLoading(true);
      // Call API to approve partner
      await partnerAuthApi.approvePartner(appToApprove, {
        approvalStatus: 'APPROVED',
        isVerified: true,
        remarks: 'Approved by admin'
      });

      // Update local state
      setApplications(apps => apps.map(a => a.id === appToApprove ? { ...a, status: 'approved' as const } : a));

      // Add to Partners List
      const newPartner: Partner = {
        id: appToApprove,
        name: app.name,
        type: 'Processor' as any,
        location: app.city,
        email: app.email,
        contactPerson: 'Pending Assignment',
        status: 'Active',
        performance: 100,
        registrationNumber: app.registrationNumber,
        facilityName: app.facilityName,
        address: app.address,
        state: app.state,
        pincode: app.pincode
      };

      setPartners(prev => [newPartner, ...prev]);
      showToast(`${app.name} has been approved and added to active partners!`);
      setShowApproveModal(false);
      setShowAppModal(false);

      // Reload data
      loadPartners();
      loadApplications();
    } catch (error) {
      console.error('Failed to approve partner:', error);
      showToast('Failed to approve partner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApp = (appId: string) => {
    setAppToReject(appId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!appToReject || !rejectReason.trim()) return;

    try {
      setLoading(true);
      await partnerAuthApi.approvePartner(appToReject, {
        approvalStatus: 'REJECTED',
        isVerified: false,
        remarks: rejectReason
      });

      setApplications(apps => apps.map(a => a.id === appToReject ? { ...a, status: 'rejected' as const } : a));
      showToast(`Partner application for ${applications.find(a => a.id === appToReject)?.name || 'this facility'} has been rejected.`, 'error');
      setShowRejectModal(false);
      setShowAppModal(false);
      setAppToReject(null);
      setRejectReason('');

      // Reload data and switch to rejected tab for reference
      loadApplications();
      setApprovalTab('rejected');
    } catch (error) {
      console.error('Failed to reject partner:', error);
      showToast('Failed to reject partner', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Bulk Actions ---
  const handleBulkApprove = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedAppIds.map(id => partnerAuthApi.approvePartner(id, {
        approvalStatus: 'APPROVED',
        isVerified: true,
        remarks: 'Bulk approved by admin'
      })));
      showToast(`Successfully approved ${selectedAppIds.length} partners.`, 'success');
      setSelectedAppIds([]);
      loadApplications();
      loadPartners();
    } catch (error) {
      console.error('Failed to bulk approve:', error);
      showToast('Error during bulk approval', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSuspend = async () => {
    try {
      setLoading(true);
      // In a real app we would call an API here.
      let newPartners = [...partners];
      for (const id of selectedPartnerIds) {
        const partner = partners.find(p => p.id === id);
        if (partner) {
          const newStatus = partner.status === 'Active' ? 'Suspended' : 'Active';
          newPartners = newPartners.map(p => p.id === id ? { ...p, status: newStatus as any } : p);
        }
      }
      setPartners(newPartners);
      showToast(`Successfully toggled status for ${selectedPartnerIds.length} partners.`, 'success');
      setSelectedPartnerIds([]);
    } catch (error) {
      console.error('Failed to bulk suspend:', error);
      showToast('Error during bulk suspend', 'error');
    } finally {
      setLoading(false);
    }
  };


  // --- Filtering ---
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || partner.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredApps = applications.filter(app => app.status === approvalTab);

  // --- Common CSV Export ---
  const handleExportCSV = () => {
    const dataToExport = viewMode === 'partners' ? filteredPartners : filteredApps;
    if (dataToExport.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    // Simple CSV logic (simplified)
    const csvContent = "data:text/csv;charset=utf-8," +
      (viewMode === 'partners'
        ? "ID,Name,Location,Status\n" + filteredPartners.map(p => `${p.id},"${p.name}","${p.location}",${p.status}`).join("\n")
        : "ID,Name,City,Status\n" + filteredApps.map(a => `${a.id},"${a.name}","${a.city}",${a.status}`).join("\n"));

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${viewMode}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${viewMode === 'partners' ? 'Partners' : 'Applications'} exported successfully!`);
  };


  return (
    <div className="space-y-6 relative">

      {/* Header & Main Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-eco-950">Partner Network</h2>
            <p className="text-eco-600 mt-1">Manage active partnerships and review new processor applications.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
            {viewMode === 'partners' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-eco-900 text-white rounded-xl text-sm font-medium hover:bg-eco-800 shadow-lg"
              >
                Add Partner Manually
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setViewMode('partners')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'partners'
              ? 'bg-white text-eco-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Active Partners
          </button>
          <button
            onClick={() => setViewMode('approvals')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'approvals'
              ? 'bg-white text-eco-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Approvals
            {pendingAppsCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingAppsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================== ACTIVE PARTNERS VIEW ==================== */}
      {viewMode === 'partners' && (
        <div className="animate-fade-in-up space-y-6">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10 relative">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPartnersPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tech-lime focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {selectedPartnerIds.length > 0 && (
                <button
                  onClick={handleBulkSuspend}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors tooltip"
                  title="Toggle Status"
                >
                  Toggle Status ({selectedPartnerIds.length})
                </button>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium min-w-[140px] justify-between">
                  <span className="flex items-center gap-2"><Filter size={16} /> {filterStatus}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 p-1 hidden group-hover:block z-20">
                  {['All', 'Active', 'Suspended'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status as any);
                        setPartnersPage(0);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterStatus === status ? 'bg-eco-50 text-eco-800 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-eco-200 border-t-eco-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading partners...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPartnerIds(filteredPartners.map(p => p.id));
                            else setSelectedPartnerIds([]);
                          }}
                          checked={selectedPartnerIds.length === filteredPartners.length && filteredPartners.length > 0}
                          className="w-4 h-4 rounded border-gray-300 text-eco-600 focus:ring-eco-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Partner</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration No.</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPartners.map((partner) => (
                      <tr key={partner.id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPartnerIds.includes(partner.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedPartnerIds([...selectedPartnerIds, partner.id]);
                              else setSelectedPartnerIds(selectedPartnerIds.filter(id => id !== partner.id));
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-eco-600 focus:ring-eco-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-700 font-bold text-sm">
                              {partner.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-eco-900">{partner.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm text-gray-900 font-medium">
                            {partner.registrationNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 flex items-center gap-1.5">
                            <MapPin size={14} className="text-gray-400" />
                            {partner.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{partner.contactPerson}</div>
                          <div className="text-xs text-gray-500">{partner.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                           ${partner.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {partner.status === 'Active' ? <CheckCircle size={12} className="mr-1" /> : <Ban size={12} className="mr-1" />}
                            {partner.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${partner.performance > 90 ? 'bg-green-500' : partner.performance > 70 ? 'bg-tech-lime' : 'bg-orange-400'}`}
                                style={{ width: `${partner.performance}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">{partner.performance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenPartnerDetails(partner)}
                              className="p-2 text-eco-600 hover:bg-eco-50 rounded-lg transition-colors tooltip"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedPartner(partner); setShowEmailModal(true); }}
                              className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors tooltip"
                              title="Send Email"
                            >
                              <Mail size={16} />
                            </button>
                            <button
                              onClick={() => handlePartnerStatusToggle(partner.id)}
                              className={`p-2 rounded-lg transition-colors tooltip ${partner.status === 'Active'
                                ? 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                                : 'text-green-500 hover:bg-green-50 hover:text-green-600'
                                }`}
                              title={partner.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                            >
                              {partner.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPartners.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    No partners found matching your criteria.
                  </div>
                )}
              </div>
            )}

            {/* Partners Pagination */}
            <div className="px-8 py-6 border-t border-gray-100 flex flex-row items-center justify-between bg-white rounded-b-[2rem] gap-4">
              <div className="flex flex-row items-center gap-4 flex-shrink-0">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap inline-block">
                  Showing <span className="text-eco-900 font-bold inline-block">{partners.length}</span> of <span className="text-eco-900 font-bold inline-block">{partnersTotalElements}</span> results
                </span>
                <div className="h-4 w-[1px] bg-gray-200 flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-400 whitespace-nowrap inline-block">
                  Page <span className="text-gray-900 font-bold inline-block">{partnersPage + 1}</span> of {partnersTotalPages}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => { setPartnersPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={partnersPage === 0 || loading}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>

                <div className="flex items-center gap-1.5 px-2">
                  {Array.from({ length: Math.min(5, partnersTotalPages) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPartnersPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${partnersPage === i ? 'bg-eco-900 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { setPartnersPage(p => Math.min(partnersTotalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={partnersPage >= partnersTotalPages - 1 || loading}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== APPROVALS VIEW ==================== */}
      {viewMode === 'approvals' && (
        <div className="animate-fade-in-up space-y-6">
          {/* Sub Tabs */}
          <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl w-fit border border-gray-200/50 mb-4">
            {['pending', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setApprovalTab(status as any);
                  setSelectedAppIds([]);
                  setAppsPage(0);
                }}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${approvalTab === status
                  ? 'bg-white text-eco-950 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
              >
                {status} Applications
                <div className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black transition-colors ${approvalTab === status
                  ? 'bg-tech-lime text-eco-950 shadow-sm'
                  : 'bg-gray-200 text-gray-500'}`}>
                  {status === 'pending' ? pendingAppsCount : rejectedAppsCount}
                </div>
              </button>
            ))}
          </div>

          {/* Bulk Actions for Approvals */}
          {selectedAppIds.length > 0 && approvalTab === 'pending' && (
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl mt-4">
              <span className="text-sm font-medium text-gray-700">{selectedAppIds.length} application(s) selected</span>
              <button
                onClick={handleBulkApprove}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-eco-900 text-white rounded-lg text-sm font-medium hover:bg-eco-800 transition-colors disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div> : <Check size={16} />}
                Bulk Approve
              </button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <div key={app.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all group relative cursor-pointer ${selectedAppIds.includes(app.id) ? 'border-eco-500 bg-eco-50/10 shadow-xl shadow-eco-900/5' : 'border-gray-50 hover:border-eco-100 hover:shadow-xl hover:shadow-eco-900/5'}`}
                onClick={() => {
                  if (selectedAppIds.includes(app.id)) setSelectedAppIds(selectedAppIds.filter(id => id !== app.id));
                  else setSelectedAppIds([...selectedAppIds, app.id]);
                }}>

                <div className="absolute top-6 right-6">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAppIds.includes(app.id) ? 'bg-eco-600 border-eco-600' : 'border-gray-200 group-hover:border-eco-300'}`}>
                    {selectedAppIds.includes(app.id) && <Check size={14} className="text-white" />}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black bg-gradient-to-br from-eco-50 to-eco-100/50 text-eco-700 border border-eco-200 shadow-sm group-hover:scale-105 transition-transform duration-500">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-eco-950 group-hover:text-eco-700 transition-colors uppercase tracking-tight">{app.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-tech-lime"></div>
                        <span>{app.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reg. Number</div>
                      <div className="text-sm font-mono font-bold text-gray-700 truncate">{app.registrationNumber || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Verification</div>
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${app.status === 'approved' ? 'text-green-600' : app.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                        {app.status === 'approved' ? <ShieldCheck size={14} /> : app.status === 'rejected' ? <X size={14} /> : <AlertCircle size={14} />}
                        {app.status === 'approved' ? 'Verified' : app.status === 'rejected' ? 'Rejected' : 'Review Needed'}
                      </div>
                    </div>
                  </div>

                  {app.status === 'rejected' && app.remarks && (
                    <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
                      <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <AlertCircle size={10} /> Rejection Reason
                      </div>
                      <p className="text-xs text-red-700 font-medium leading-relaxed italic">
                        "{app.remarks}"
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applied Date</span>
                      <span className="text-sm font-bold text-gray-600">{app.regDate}</span>
                    </div>

                    <div className="flex gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenAppDetails(app)}
                        className="p-3 text-gray-400 hover:text-eco-900 hover:bg-eco-50 rounded-xl transition-all"
                      >
                        <Eye size={20} />
                      </button>
                      {approvalTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRejectApp(app.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveApp(app.id)}
                            className="px-6 py-2 bg-eco-950 text-white rounded-xl hover:bg-eco-800 font-bold text-sm transition-all shadow-lg shadow-eco-900/10 active:scale-95"
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredApps.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Search size={32} />
              </div>
              <p className="text-gray-500 font-medium">No {approvalTab} applications found.</p>
            </div>
          )}

          {/* Applications Pagination */}
          <div className="mt-8 px-8 py-6 flex flex-row items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm gap-4">
            <div className="flex flex-row items-center gap-4 flex-shrink-0">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap inline-block">
                Showing <span className="text-eco-900 font-bold inline-block">{applications.length}</span> of <span className="text-eco-900 font-bold inline-block">{appsTotalElements}</span> results
              </span>
              <div className="h-4 w-[1px] bg-gray-200 flex-shrink-0"></div>
              <span className="text-sm font-medium text-gray-400 whitespace-nowrap inline-block">
                Page <span className="text-gray-900 font-bold inline-block">{appsPage + 1}</span> of {appsTotalPages}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => { setAppsPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={appsPage === 0 || loading}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: Math.min(5, appsTotalPages) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setAppsPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${appsPage === i ? 'bg-eco-900 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setAppsPage(p => Math.min(appsTotalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={appsPage >= appsTotalPages - 1 || loading}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Partner Details Modal */}
      {showDetailsModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 md:left-80 bg-black/40 transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative w-full max-w-2xl md:ml-80 bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-black/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-8 py-7 bg-gradient-to-br from-gray-50/80 to-white border-b border-gray-100 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-eco-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-eco-900/10 shrink-0">
                  <Activity size={26} />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-2xl font-display font-bold text-eco-950 leading-tight truncate">Partner Profile</h3>
                  <div className="flex items-center gap-2 mt-1 whitespace-nowrap overflow-hidden">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Partner ID:</span>
                    <span className="text-[10px] font-mono font-bold text-eco-600 bg-eco-50 px-2 py-0.5 rounded-md truncate">{selectedPartner.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2.5 rounded-xl transition-all ${isEditing ? 'bg-eco-900 text-white shadow-lg' : 'text-eco-600 hover:bg-eco-50'}`}
                  title={isEditing ? "Cancel Editing" : "Edit Profile"}
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2.5 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSavePartner} className="p-8 space-y-8">

                {/* Section: Organization Info */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-eco-50 flex items-center justify-center text-eco-600">
                      <Building size={18} />
                    </div>
                    <h4 className="text-sm font-black text-eco-950 uppercase tracking-widest">Organization Info</h4>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Company / Facility Name</label>
                      <input
                        type="text"
                        value={selectedPartner.name}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPartner({ ...selectedPartner, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Operational Location</label>
                      <input
                        type="text"
                        value={selectedPartner.location}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPartner({ ...selectedPartner, location: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                        placeholder="e.g. Navi Mumbai, Maharashtra"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Contact Details */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-tech-lime/10 flex items-center justify-center text-tech-lime-700">
                      <User size={18} />
                    </div>
                    <h4 className="text-sm font-black text-eco-950 uppercase tracking-widest">Point of Contact</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Contact Person</label>
                      <input
                        type="text"
                        value={selectedPartner.contactPerson}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPartner({ ...selectedPartner, contactPerson: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={selectedPartner.email}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedPartner({ ...selectedPartner, email: e.target.value })}
                          className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                        />
                        {!isEditing && <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 border border-gray-200 rounded-[1.25rem] text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-eco-950 text-white rounded-[1.25rem] font-bold hover:bg-eco-800 flex items-center justify-center gap-2 shadow-xl shadow-eco-900/20 transition-all active:scale-95"
                    >
                      <Save size={18} /> Save Profile Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Status Info Footer */}
            {!isEditing && (
              <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${selectedPartner.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-bold text-gray-600">Account status: {selectedPartner.status}</span>
                </div>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-6 py-3 bg-white border border-gray-200 text-eco-900 rounded-xl text-sm font-bold hover:bg-eco-50 hover:border-eco-100 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Send size={16} /> Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showAppModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 md:left-80 bg-black/40 transition-opacity" onClick={() => setShowAppModal(false)}></div>
          <div className="relative w-full max-w-2xl md:ml-80 bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-black/5 overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-8 py-7 bg-gradient-to-br from-gray-50/80 to-white border-b border-gray-100 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-eco-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-eco-900/10 shrink-0">
                  <FileText size={26} />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-2xl font-display font-bold text-eco-950 leading-tight truncate">Application Details</h3>
                  <div className="flex items-center gap-2 mt-1 whitespace-nowrap overflow-hidden">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">ID:</span>
                    <span className="text-[10px] font-mono font-bold text-eco-600 bg-eco-50 px-2 py-0.5 rounded-md truncate">{selectedApp.id}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-300 mx-1 shrink-0"></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0 ${selectedApp.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      selectedApp.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2.5 rounded-xl transition-all ${isEditing ? 'bg-eco-900 text-white shadow-lg' : 'text-eco-600 hover:bg-eco-50'}`}
                  title={isEditing ? "Cancel Editing" : "Edit Application"}
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => setShowAppModal(false)}
                  className="p-2.5 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSaveAppDetails} className="p-8 space-y-8">

                {/* Section: Facility Information */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-eco-50 flex items-center justify-center text-eco-600">
                      <Building size={18} />
                    </div>
                    <h4 className="text-sm font-black text-eco-950 uppercase tracking-widest">Facility Information</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Organization Name</label>
                      <input
                        type="text"
                        value={selectedApp.name}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedApp({ ...selectedApp, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                        placeholder="e.g. EcoRecycle Solutions"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Registration Number</label>
                      <input
                        type="text"
                        value={selectedApp.registrationNumber || ''}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedApp({ ...selectedApp, registrationNumber: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-mono font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                        placeholder="REG-123456"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">City / State</label>
                      <input
                        type="text"
                        value={selectedApp.city}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedApp({ ...selectedApp, city: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                        placeholder="e.g. Mumbai, MH"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Contact & Verification */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-tech-lime/10 flex items-center justify-center text-tech-lime-700">
                      <Mail size={18} />
                    </div>
                    <h4 className="text-sm font-black text-eco-950 uppercase tracking-widest">Contact & Verification</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                      <input
                        type="email"
                        value={selectedApp.email}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedApp({ ...selectedApp, email: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-tech-lime/10 focus:border-tech-lime/30 transition-all text-eco-950 disabled:bg-gray-50/30 disabled:text-eco-900/60"
                        placeholder="contact@facility.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Owner / Contact Person</label>
                      <input
                        type="text"
                        value={selectedApp.phone || ''}
                        disabled
                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium text-eco-950/60"
                      />
                    </div>                  </div>
                </div>

                {/* Section: Uploaded Certificates */}
                {selectedApp.documentUrls && selectedApp.documentUrls.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <FileText size={18} />
                      </div>
                      <h4 className="text-sm font-black text-eco-950 uppercase tracking-widest">
                        Uploaded Certificates
                        <span className="ml-2 text-[10px] font-bold text-gray-400 normal-case tracking-normal">
                          ({selectedApp.documentUrls.length} file{selectedApp.documentUrls.length > 1 ? 's' : ''})
                        </span>
                      </h4>
                    </div>
                    <div className="flex flex-col gap-2">
                      {selectedApp.documentUrls.map((url, i) => {
                        const isPdf = url.toLowerCase().includes('.pdf');
                        const filename = url.split('/').pop()?.split('?')[0] || `Document ${i + 1}`;
                        return (
                          <div key={i} className="flex items-center gap-3 p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-700 truncate">
                                {isPdf ? 'PDF Document' : 'Image'} {i + 1}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate font-mono">{filename}</p>
                            </div>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-50 transition-all shrink-0"
                            >
                              <Eye size={13} /> View
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 border border-gray-200 rounded-[1.25rem] text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Cancel Changes
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-eco-950 text-white rounded-[1.25rem] font-bold hover:bg-eco-800 flex items-center justify-center gap-2 shadow-xl shadow-eco-900/20 transition-all active:scale-95"
                    >
                      <Save size={18} /> Update Facility Record
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer Actions */}
            {!isEditing && selectedApp.status === 'pending' && (
              <div className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex gap-4 shrink-0">
                <button
                  onClick={() => { handleRejectApp(selectedApp.id); }}
                  className="flex-1 py-4 bg-white border-2 border-red-100 text-red-600 rounded-[1.25rem] font-bold hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Ban size={18} /> Reject Partner
                </button>
                <button
                  onClick={() => { handleApproveApp(selectedApp.id); }}
                  className="flex-[2] py-4 bg-gradient-to-r from-eco-900 to-eco-950 text-white rounded-[1.25rem] font-bold hover:shadow-2xl hover:shadow-eco-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-eco-900/20"
                >
                  <CheckCircle size={18} /> Approve Application
                </button>
              </div>
            )}

            {!isEditing && selectedApp.status === 'rejected' && (
              <div className="p-8 bg-red-50/30 backdrop-blur-sm border-t border-red-100/50 flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                  <AlertCircle size={16} />
                  <span>This application was rejected</span>
                </div>
                {selectedApp.remarks && (
                  <p className="text-xs text-red-800 bg-red-50 p-4 rounded-2xl border border-red-100 font-medium italic leading-relaxed">
                    "{selectedApp.remarks}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 md:left-80 bg-black/40 transition-opacity" onClick={() => setShowEmailModal(false)}></div>
          <div className="relative w-full max-w-lg md:ml-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-eco-900 flex items-center gap-2"><Mail size={18} className="text-eco-600" /> Message {selectedPartner.name}</h3>
              <button onClick={() => setShowEmailModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient</label>
                <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">{selectedPartner.contactPerson} &lt;{selectedPartner.email}&gt;</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                <input type="text" defaultValue="Regarding: Quarterly Performance Review" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Message</label>
                <textarea rows={5} className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-sm resize-none" placeholder="Type your message here..."></textarea>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={() => { const btn = document.getElementById('sendBtn'); if (btn) btn.innerText = 'Sending...'; setTimeout(() => setShowEmailModal(false), 1000); }} id="sendBtn" className="px-6 py-2 bg-eco-900 text-white rounded-xl text-sm font-medium hover:bg-eco-800 transition-colors flex items-center gap-2"><Send size={16} /> Send Message</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 md:left-80 bg-black/40 transition-opacity" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative w-full max-w-md md:ml-80 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/40 overflow-hidden animate-fade-in-up">
            <div className="px-8 py-6 bg-red-50/20 border-b border-white/20 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-red-900">Reject Application</h3>
                <p className="text-sm text-red-600 mt-1 font-medium">Please provide a reason for rejection.</p>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="p-2 hover:bg-red-100/50 rounded-full text-red-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-red-50/30 backdrop-blur-sm border border-red-100/50 rounded-2xl p-4 flex gap-3 items-start">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-xs text-red-700 leading-relaxed font-medium">
                  This action cannot be undone. An email will be sent to the applicant with the reason provided below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1 text-red-900/50">Rejection Reason</label>
                <textarea
                  autoFocus
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Documents provided are invalid or incomplete..."
                  className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none text-gray-900 placeholder-gray-400"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3.5 border border-white/40 bg-white/20 rounded-2xl text-gray-600 font-bold hover:bg-white/40 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={loading || !rejectReason.trim()}
                  className="flex-[2] py-3.5 bg-red-600/90 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <X size={18} />
                      <span>Confirm Rejection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 md:left-80 bg-black/40 transition-opacity" onClick={() => setShowApproveModal(false)}></div>
          <div className="relative w-full max-w-md md:ml-80 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/40 overflow-hidden animate-fade-in-up">
            <div className="px-8 py-6 bg-eco-50/20 border-b border-white/20 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-bold text-eco-900">Approve Application</h3>
                <p className="text-sm text-eco-600 mt-1 font-medium">Verify and activate this partner account.</p>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="p-2 hover:bg-eco-100/50 rounded-full text-eco-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-eco-50/30 backdrop-blur-sm border border-eco-100/50 rounded-2xl p-4 flex gap-3 items-start">
                <ShieldCheck className="text-eco-600 shrink-0" size={20} />
                <p className="text-xs text-eco-700 leading-relaxed font-medium">
                  Approving this application will grant the partner full access to their dashboard and list them in the active partner directory.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-eco-100 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-eco-700" />
                  </div>
                  <p className="text-sm text-gray-600">Verified facility documents and credentials.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-eco-100 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-eco-700" />
                  </div>
                  <p className="text-sm text-gray-600">Enabled automatic order assignment for the city.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 py-3.5 border border-white/40 bg-white/20 rounded-2xl text-gray-600 font-bold hover:bg-white/40 transition-all active:scale-95"
                >
                  Go Back
                </button>
                <button
                  onClick={handleApproveConfirm}
                  disabled={loading}
                  className="flex-[2] py-3.5 bg-eco-900 text-white rounded-2xl font-bold hover:bg-eco-800 transition-all shadow-lg shadow-eco-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Confirm Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Partner Modal */}
      {showCreateModal && (
        <CreatePartnerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPartners();
          }}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

function CreatePartnerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    temporaryPassword: '',
    mobileNumber: '',
    registrationNumber: '',
    facilityName: '',
    address: '',
    latitude: 0,
    longitude: 0,
    capacity: 1000,
    contactNumber: '',
    operatingHours: '9AM-6PM',
    state: '',
    pincode: '',
    autoApprove: true
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await partnerAuthApi.adminCreatePartner(formData);
      showToast('Partner account created successfully!', 'success');
      onSuccess();
    } catch (error) {
      console.error('Failed to create partner:', error);
      showToast('Failed to create partner account. Please check all fields.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 md:left-80 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl md:ml-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-display font-bold text-eco-900">Create Partner Account</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-eco-800 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-tech-lime"></div>
                Account Credentials
              </h4>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email</label>
                <input type="email" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Temporary Password</label>
                <input type="password" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.temporaryPassword} onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Mobile Number</label>
                <input type="tel" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-eco-800 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-tech-lime"></div>
                Facility Details
              </h4>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Facility Name</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.facilityName} onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Reg. Number</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.registrationNumber} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Latitude</label>
                  <input type="number" step="0.000001" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Longitude</label>
                  <input type="number" step="0.000001" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Contact No.</label>
                <input type="tel" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-eco-800 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-tech-lime"></div>
              Location Info
            </h4>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Address</label>
              <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">State</label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Pincode</label>
                <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 transition-all" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4 sticky bottom-0 bg-white border-t border-gray-100 mt-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3.5 bg-eco-950 text-white rounded-2xl font-bold hover:bg-eco-800 transition-all shadow-lg shadow-eco-900/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={20} />
                  <span>Create Partner Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}