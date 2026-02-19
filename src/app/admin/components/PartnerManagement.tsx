'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MoreHorizontal, Mail, Ban, CheckCircle, MapPin, 
  Building, Send, X, Download, Eye, Edit2, Save, ShieldCheck, 
  AlertCircle, Check, Briefcase, FileText
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { partnerAuthApi } from '@/lib/partner-auth-api';

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
  type: string;
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
  
  // --- Approvals Tab State ---
  const [approvalTab, setApprovalTab] = useState<'pending' | 'rejected'>('pending');
  const [applications, setApplications] = useState<Application[]>([]);

  // --- Modals State ---
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // --- Load Data on Mount ---
  useEffect(() => {
    loadPartners();
    loadApplications();
  }, []);

  // --- API Functions ---
  const loadPartners = async () => {
    setLoading(true);
    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/partners?page=0&size=100&isVerified=true', {
        headers,
      });
      const data = await response.json();
      
      // Transform API data to match UI format
      const transformedPartners: Partner[] = (data.content || []).map((p: any) => ({
        id: p.id,
        name: p.facilityName || p.name || 'Unknown',
        type: 'Processor' as const, // Default type
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
    } catch (error) {
      console.error('Failed to load partners:', error);
      showToast('Failed to load partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      // Load pending applications
      const pendingData = await partnerAuthApi.listPartnersByStatus('PENDING', 0, 50);
      const rejectedData = await partnerAuthApi.listPartnersByStatus('REJECTED', 0, 50);
      
      // Transform API data to match UI format
      const transformPending: Application[] = (pendingData.content || []).map((p: any) => ({
        id: p.id,
        name: p.facilityName || 'Unknown',
        type: 'Processor', // Default
        regDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
        city: `${p.state || ''}, ${p.pincode || ''}`.trim() || 'Unknown',
        status: 'pending' as const,
        documents: p.isVerified ? 'Verified' : 'Review Needed',
        email: p.email || '',
        phone: p.contactNumber || '',
        registrationNumber: p.registrationNumber,
        facilityName: p.facilityName,
        address: p.address,
        state: p.state,
        pincode: p.pincode,
        approvalStatus: p.approvalStatus,
        isVerified: p.isVerified,
        createdAt: p.createdAt
      }));

      const transformRejected: Application[] = (rejectedData.content || []).map((p: any) => ({
        id: p.id,
        name: p.facilityName || 'Unknown',
        type: 'Processor',
        regDate: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
        city: `${p.state || ''}, ${p.pincode || ''}`.trim() || 'Unknown',
        status: 'rejected' as const,
        documents: 'Incomplete',
        email: p.email || '',
        phone: p.contactNumber || '',
        registrationNumber: p.registrationNumber,
        facilityName: p.facilityName,
        address: p.address,
        state: p.state,
        pincode: p.pincode,
        approvalStatus: p.approvalStatus,
        isVerified: p.isVerified,
        createdAt: p.createdAt
      }));
      
      setApplications([...transformPending, ...transformRejected]);
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

  const handleApproveApp = async (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    try {
      // Call API to approve partner
      await partnerAuthApi.approvePartner(appId, {
        approvalStatus: 'APPROVED',
        isVerified: true,
        remarks: 'Approved by admin'
      });

      // Update local state
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: 'approved' as const } : a));

      // Add to Partners List
      const newPartner: Partner = {
        id: appId,
        name: app.name,
        type: app.type as any,
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
      setShowAppModal(false);
      
      // Reload data
      loadPartners();
      loadApplications();
      
      // Switch view to see the new partner
      setViewMode('partners');
    } catch (error) {
      console.error('Failed to approve partner:', error);
      showToast('Failed to approve partner', 'error');
    }
  };

  const handleRejectApp = async (appId: string) => {
    const remarks = prompt('Enter rejection reason:');
    if (!remarks) return;

    try {
      await partnerAuthApi.approvePartner(appId, {
        approvalStatus: 'REJECTED',
        isVerified: false,
        remarks
      });

      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: 'rejected' as const } : a));
      showToast('Application rejected.', 'info');
      setShowAppModal(false);
      
      // Reload data
      loadApplications();
    } catch (error) {
      console.error('Failed to reject partner:', error);
      showToast('Failed to reject partner', 'error');
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
        ? "ID,Name,Type,Location,Status\n" + filteredPartners.map(p => `${p.id},"${p.name}",${p.type},"${p.location}",${p.status}`).join("\n")
        : "ID,Name,Type,City,Status\n" + filteredApps.map(a => `${a.id},"${a.name}",${a.type},"${a.city}",${a.status}`).join("\n"));

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
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'partners' 
                ? 'bg-white text-eco-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Partners
          </button>
          <button 
            onClick={() => setViewMode('approvals')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              viewMode === 'approvals' 
                ? 'bg-white text-eco-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Approvals
            {applications.filter(a => a.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {applications.filter(a => a.status === 'pending').length}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tech-lime focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium min-w-[140px] justify-between">
                  <span className="flex items-center gap-2"><Filter size={16} /> {filterStatus}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 p-1 hidden group-hover:block z-20">
                  {['All', 'Active', 'Suspended'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setFilterStatus(status as any)}
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
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-700 font-bold text-sm">
                            {partner.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-eco-900">{partner.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Building size={10} /> {partner.type}
                            </div>
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
                           {partner.status === 'Active' ? <CheckCircle size={12} className="mr-1"/> : <Ban size={12} className="mr-1"/>}
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
                            className={`p-2 rounded-lg transition-colors tooltip ${
                              partner.status === 'Active' 
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
          </div>
        </div>
      )}

      {/* ==================== APPROVALS VIEW ==================== */}
      {viewMode === 'approvals' && (
        <div className="animate-fade-in-up space-y-6">
           {/* Sub Tabs */}
           <div className="flex gap-4 border-b border-gray-200">
             {['pending', 'rejected'].map((status) => (
               <button
                 key={status}
                 onClick={() => setApprovalTab(status as any)}
                 className={`pb-3 px-2 text-sm font-medium capitalize transition-all relative ${
                   approvalTab === status 
                     ? 'text-eco-900' 
                     : 'text-gray-400 hover:text-gray-600'
                 }`}
               >
                 {status} Applications
                 <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                   approvalTab === status ? 'bg-eco-100 text-eco-800' : 'bg-gray-100'
                 }`}>
                   {applications.filter(a => a.status === status).length}
                 </span>
                 {approvalTab === status && (
                   <div className="absolute bottom-0 left-0 w-full h-0.5 bg-tech-lime"></div>
                 )}
               </button>
             ))}
           </div>

           {/* Cards Grid */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
             {filteredApps.map((app) => (
               <div key={app.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start">
                   <div className="flex items-start gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 
                        ${app.type === 'Processor' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                          app.type === 'Collector' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                          'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {app.name.charAt(0)}
                     </div>
                     <div>
                       <h3 className="font-bold text-lg text-eco-900">{app.name}</h3>
                       <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                         <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide font-medium">{app.type}</span>
                         <span>•</span>
                         <span>{app.city}</span>
                       </div>
                     </div>
                   </div>
                   
                   <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                     ${app.documents === 'Verified' ? 'bg-green-50 text-green-700 border-green-100' : 
                       'bg-amber-50 text-amber-700 border-amber-100'}`}>
                     {app.documents === 'Verified' ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                     {app.documents}
                   </div>
                 </div>

                 <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                   <div className="text-xs text-gray-400">
                     Applied: <span className="text-gray-600 font-medium">{app.regDate}</span>
                   </div>
                   
                   <div className="flex gap-2">
                     <button 
                      onClick={() => handleOpenAppDetails(app)}
                      className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors tooltip" 
                      title="View Details"
                     >
                       <Eye size={20} />
                     </button>
                     {approvalTab === 'pending' && (
                       <>
                         <button 
                          onClick={() => handleRejectApp(app.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
                         >
                           <X size={16} /> Reject
                         </button>
                         <button 
                          onClick={() => handleApproveApp(app.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-eco-900 text-white rounded-lg hover:bg-eco-800 font-medium text-sm transition-colors shadow-md hover:shadow-lg"
                         >
                           <Check size={16} /> Approve
                         </button>
                       </>
                     )}
                   </div>
                 </div>
               </div>
             ))}
             
             {filteredApps.length === 0 && (
               <div className="col-span-full py-12 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                   <Search size={32} />
                 </div>
                 <p className="text-gray-500 font-medium">No {approvalTab} applications found.</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Partner Details Modal */}
      {showDetailsModal && selectedPartner && (
         <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up">
             
             <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-eco-900">Partner Details</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: <span className="font-mono">{selectedPartner.id}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-blue-100 text-blue-600' : 'text-blue-600 hover:bg-blue-50'}`}
                    title="Edit Record"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
             </div>

             <form onSubmit={handleSavePartner} className="p-8 space-y-4">
                {/* Reused Form Fields for Partner */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Partner Name</label>
                  <input 
                    type="text" 
                    value={selectedPartner.name} 
                    disabled={!isEditing}
                    onChange={(e) => setSelectedPartner({ ...selectedPartner, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Type</label>
                      <select
                        value={selectedPartner.type}
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPartner({ ...selectedPartner, type: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 appearance-none text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                      >
                         <option value="Processor">Processor</option>
                         <option value="Collector">Collector</option>
                         <option value="Refurbisher">Refurbisher</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Location</label>
                      <input 
                        type="text" 
                        value={selectedPartner.location} 
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPartner({ ...selectedPartner, location: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Contact Person</label>
                      <input 
                        type="text" 
                        value={selectedPartner.contactPerson} 
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPartner({ ...selectedPartner, contactPerson: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                      <input 
                        type="email" 
                        value={selectedPartner.email} 
                        disabled={!isEditing}
                        onChange={(e) => setSelectedPartner({ ...selectedPartner, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                   </div>
                </div>

                {isEditing && (
                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
                   </div>
                )}
             </form>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showAppModal && selectedApp && (
        <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity" onClick={() => setShowAppModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up">
             
             <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-eco-900">Application Details</h3>
                  <p className="text-sm text-gray-500 mt-1">ID: <span className="font-mono">{selectedApp.id}</span> • Status: <span className="capitalize">{selectedApp.status}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-blue-100 text-blue-600' : 'text-blue-600 hover:bg-blue-50'}`}><Edit2 size={18} /></button>
                  <button onClick={() => setShowAppModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
                </div>
             </div>

             <form onSubmit={handleSaveAppDetails} className="p-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Organization Name</label>
                  <input type="text" value={selectedApp.name} disabled={!isEditing} onChange={(e) => setSelectedApp({ ...selectedApp, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Type</label>
                      <select value={selectedApp.type} disabled={!isEditing} onChange={(e) => setSelectedApp({ ...selectedApp, type: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 appearance-none text-gray-700 disabled:bg-gray-100 disabled:text-gray-500">
                         <option value="Processor">Processor</option>
                         <option value="Collector">Collector</option>
                         <option value="Refurbisher">Refurbisher</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">City</label>
                      <input type="text" value={selectedApp.city} disabled={!isEditing} onChange={(e) => setSelectedApp({ ...selectedApp, city: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"/>
                   </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                  <input type="email" value={selectedApp.email} disabled={!isEditing} onChange={(e) => setSelectedApp({ ...selectedApp, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Document Status</label>
                  <input type="text" value={selectedApp.documents} disabled={true} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500"/>
                </div>

                {isEditing && (
                   <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
                   </div>
                )}
             </form>

             {!isEditing && selectedApp.status === 'pending' && (
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
                   <button onClick={() => { handleRejectApp(selectedApp.id); }} className="flex-1 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50">Reject Application</button>
                   <button onClick={() => { handleApproveApp(selectedApp.id); }} className="flex-1 py-3 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 shadow-lg">Approve Application</button>
                </div>
             )}
          </div>
        </div>
       )}

      {/* Email Modal */}
      {showEmailModal && selectedPartner && (
        <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity" onClick={() => setShowEmailModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up">
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
                 <input type="text" defaultValue="Regarding: Quarterly Performance Review" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-sm"/>
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

// Create Partner Modal Component
function CreatePartnerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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
      alert('Partner created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create partner:', error);
      alert('Failed to create partner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <h3 className="text-xl font-display font-bold text-eco-900">Create Partner Account</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Temporary Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.temporaryPassword}
                onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mobile Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Registration Number</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Facility Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Address</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Latitude</label>
              <input
                type="number"
                step="0.000001"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Longitude</label>
              <input
                type="number"
                step="0.000001"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">State</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Pincode</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}