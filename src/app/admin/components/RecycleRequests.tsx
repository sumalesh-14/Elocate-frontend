'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Filter, X, Truck,
  MapPin, Calendar, Smartphone, User, FileText,
  AlertCircle, ChevronRight, Laptop, Printer, Tv, Headphones,
  ArrowLeft, MessageSquare, Star, UserCheck,
  Building2, Navigation, Sliders, Bell, History, Shield,
  MoreHorizontal, Mail, Ban, CheckCircle, Building, Send, Download, Eye, Edit2, Save, ShieldCheck, Check, Briefcase, Phone
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { adminRecycleRequestApi, recycleRequestApi, adminFacilitiesApi } from '@/lib/admin-api';

// --- Types ---

interface StatusHistory {
  id: string;
  oldStatus: string;
  newStatus: string;
  statusType: 'RECYCLE_STATUS' | 'FULFILLMENT_STATUS';
  changedAt: string;
  changedBy: string;
  changedByName?: string;
  comments: string;
}

interface RecycleRequest {
  id: string;
  requestNumber: string;
  citizenName: string;
  citizenEmail: string;
  deviceType: string;
  deviceModel: string;
  condition: string;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupPincode: string;
  pickupDate: string;
  status: string;
  fulfillmentStatusDisplay: string;
  assignedPartner?: string;
  facilityName?: string;
  facilityAddress?: string;
  facilityEmail?: string;
  facilityPhone?: string;
  description?: string;
  estimatedAmount: number;
  finalAmount?: number;
  fulfillmentType: string;
  createdAt: string;
  updatedAt: string;
}

interface Partner {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
}



export const RecycleRequests: React.FC = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RecycleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // View State
  const [selectedRequest, setSelectedRequest] = useState<RecycleRequest | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [facilities, setFacilities] = useState<Partner[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'All') params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await adminRecycleRequestApi.getAll(params);

      // Transform backend data to frontend model
      const transformed = response.data.map((req: any) => ({
        id: req.id,
        requestNumber: req.requestNumber,
        citizenName: req.citizenName || 'Unknown Citizen',
        citizenEmail: req.citizenEmail || 'N/A',
        deviceType: req.categoryName || 'Unknown Device',
        deviceModel: req.brandName + ' ' + req.deviceModelName,
        condition: req.conditionCode,
        pickupAddress: req.pickupAddress || 'N/A',
        pickupCity: req.pickupCity,
        pickupState: req.pickupState,
        pickupPincode: req.pickupPincode,
        pickupDate: req.pickupDate || 'Not Scheduled',
        status: req.status,
        fulfillmentStatusDisplay: req.fulfillmentStatusDisplay,
        facilityName: req.facilityName,
        facilityAddress: req.facilityAddress,
        facilityEmail: req.facilityEmail,
        facilityPhone: req.facilityPhone,
        assignedPartner: req.facilityName,
        estimatedAmount: req.estimatedAmount,
        finalAmount: req.finalAmount,
        fulfillmentType: req.fulfillmentType,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt
      }));

      setRequests(transformed);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      showToast('Could not load recycle requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, [filterStatus, searchTerm]);

  // Fetch History when request selected
  const fetchHistory = async (requestId: string) => {
    try {
      setLoadingHistory(true);
      const response = await recycleRequestApi.getStatusHistory(requestId);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectRequest = (req: RecycleRequest) => {
    setSelectedRequest(req);
    fetchHistory(req.id);
  };

  const fetchFacilities = async () => {
    try {
      setLoadingFacilities(true);
      const response = await adminFacilitiesApi.getAll({ size: 100 });
      // Map backend FacilityResponse to Partner interface
      const mapped = response.data.content.map((f: any) => ({
        id: f.id,
        name: f.name,
        type: 'Facility',
        location: f.address,
        rating: 4.5 // Default placeholder since not in DB yet
      }));
      setFacilities(mapped);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
      showToast('Could not load facilities.', 'error');
    } finally {
      setLoadingFacilities(false);
    }
  };

  useEffect(() => {
    if (showReassignModal) {
      fetchFacilities();
    }
  }, [showReassignModal]);

  // --- Pagination State ---
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Modal Filter State
  const [partnerSearch, setPartnerSearch] = useState('');
  const [maxDistance, setMaxDistance] = useState<string>('All');

  // Helper to get icon for device
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Laptop': return <Laptop size={20} />;
      case 'Printer': return <Printer size={20} />;
      case 'Television': return <Tv size={20} />;
      case 'Audio': return <Headphones size={20} />;
      default: return <Smartphone size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECYCLED':
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'VERIFIED':
      case 'APPROVED':
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PICKUP_COMPLETED':
      case 'DROPPED_AT_FACILITY':
      case 'Picked Up': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PICKUP_ASSIGNED':
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CREATED':
      case 'PICKUP_REQUESTED':
      case 'DROP_PENDING':
      case 'Pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'CANCELLED':
      case 'REJECTED':
      case 'LOCKED':
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getSimulatedDistance = (partnerLoc: string, address: string): number => {
    return Number((Math.random() * 20 + 1).toFixed(1));
  };

  const handleAssignPartner = async (facilityId: string) => {
    if (!selectedRequest) return;

    try {
      await adminRecycleRequestApi.reassignFacility(selectedRequest.id, {
        newFacilityId: facilityId,
        reason: 'Admin assigned via dashboard'
      });

      showToast('Facility assigned successfully!', 'success');
      setShowReassignModal(false);

      // Refresh data
      const resp = await adminRecycleRequestApi.getById(selectedRequest.id);
      handleSelectRequest(resp.data);
      fetchRequests();
    } catch (error) {
      console.error('Failed to assign facility:', error);
      showToast('Assignment failed.', 'error');
    }
  };

  const handleSendReminder = () => {
    if (!selectedRequest?.facilityName) return;

    showToast(
      `Reminder sent to ${selectedRequest.facilityName}.\nAsking them to confirm pickup for Request ID: ${selectedRequest.requestNumber}.`,
      'info'
    );
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.citizenName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const total = filteredRequests.length;
  const paginatedRequests = filteredRequests.slice(page * pageSize, (page + 1) * pageSize);

  const filteredPartnersList = facilities
    .map(p => ({
      ...p,
      distance: getSimulatedDistance(p.location, selectedRequest?.pickupAddress || '')
    }))
    .filter(p => {
      const matchesName = p.name.toLowerCase().includes(partnerSearch.toLowerCase());
      const distanceVal = maxDistance === 'All' ? Infinity : Number(maxDistance);
      const matchesDistance = p.distance <= distanceVal;
      return matchesName && matchesDistance;
    })
    .sort((a, b) => a.distance - b.distance);



  // --- DETAIL VIEW RENDER (In-Flow, Replacing List) ---
  if (selectedRequest) {
    return (
      <div className="space-y-6 relative">
        {/* Navigation Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedRequest(null)}
            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-display font-bold text-eco-950 flex items-center gap-3">
              Request Details
              <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${getStatusColor(selectedRequest.status)}`}>
                {selectedRequest.status}
              </span>
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-gray-500 text-sm">Request ID:</span>
              <span className="font-mono text-eco-900 font-bold text-sm tracking-tight">{selectedRequest.requestNumber}</span>
            </div>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => {
                setPartnerSearch('');
                setMaxDistance('All');
                setShowReassignModal(true);
              }}
              disabled={selectedRequest.status !== 'CREATED'}
              className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg ${selectedRequest.status === 'CREATED'
                ? "bg-eco-900 text-white hover:bg-eco-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
            >
              <UserCheck size={18} />
              {selectedRequest.facilityName ? 'Reassign Partner' : 'Assign Partner'}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Info Cards */}
          <div className="lg:col-span-2 space-y-6">

            {/* Citizen & Device Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-eco-50 to-blue-50 flex items-center justify-center text-eco-700 border border-eco-100 shrink-0">
                    {getDeviceIcon(selectedRequest.deviceType)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-eco-900">{selectedRequest.deviceModel}</h3>
                    <p className="text-gray-500">{selectedRequest.deviceType} • {selectedRequest.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-1">Request Date</div>
                  <div className="font-medium text-eco-900 flex items-center justify-end gap-2">
                    <Calendar size={16} className="text-tech-lime-dark" />
                    {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} /> Citizen Details
                  </h4>
                  <div className="space-y-3">
                    <div className="font-medium text-eco-900 text-lg">{selectedRequest.citizenName}</div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 w-fit px-3 py-1.5 rounded-lg text-sm">
                      <MessageSquare size={16} /> {selectedRequest.citizenEmail}
                    </div>
                    <div className="flex items-start gap-2 text-gray-600 mt-2">
                      <MapPin size={18} className="shrink-0 mt-0.5 text-eco-500" />
                      <span className="leading-relaxed">{selectedRequest.pickupAddress}, {selectedRequest.pickupCity}, {selectedRequest.pickupState} {selectedRequest.pickupPincode}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Truck size={16} /> Pickup Logistics
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-eco-50 rounded-xl p-4 border border-eco-100">
                      <div className="text-xs text-eco-600 font-medium mb-1">Status</div>
                      <div className="font-bold text-eco-900">{selectedRequest.fulfillmentStatusDisplay}</div>
                      <div className="text-sm text-eco-700 mt-1">{selectedRequest.pickupDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Facility Details Section */}
            {selectedRequest.facilityName && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building size={16} /> Facility Details
                </h4>
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-eco-900 text-lg mb-1">{selectedRequest.facilityName}</div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-blue-500" />
                        <span className="text-sm leading-relaxed">{selectedRequest.facilityAddress || 'No address provided'}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.facilityEmail && (
                        <div className="flex items-center gap-1.5 text-blue-700 bg-white border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                          <Mail size={14} /> {selectedRequest.facilityEmail}
                        </div>
                      )}
                      {selectedRequest.facilityPhone && (
                        <div className="flex items-center gap-1.5 text-green-700 bg-white border border-green-100 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                          <Phone size={14} /> {selectedRequest.facilityPhone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Static Feedback Section */}
            <div className="mt-8 border-t border-gray-100 pt-8">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star size={16} /> Citizen Feedback
              </h4>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex gap-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                  </div>
                  <span className="text-sm font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">5.0 / 5.0</span>
                </div>
                <p className="text-gray-600 italic leading-relaxed">
                  "The pickup was smooth and the driver was very professional. I am satisfied with the credit points received for my old laptop. Great initiative for e-waste management!"
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                  <CheckCircle size={14} className="text-green-500" /> Verified Experience
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 h-fit lg:col-span-1">
            <h3 className="font-display font-bold text-xl text-eco-900 mb-6">Request Timeline</h3>

            {loadingHistory ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-eco-200 border-t-eco-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">Loading history...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {history.slice().sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()).map((event, idx) => (
                  <div key={idx} className="relative flex gap-4 group">
                    <div className="relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-white border-eco-500 text-eco-500">
                      <div className="w-2 h-2 rounded-full bg-eco-500"></div>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">{event.newStatus.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">
                        {new Date(event.changedAt).toLocaleString()}
                      </div>
                      {event.comments && <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">{event.comments}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                No timeline data available.
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <button
                onClick={() => setShowAuditModal(true)}
                className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <History size={16} /> View Audit Log
              </button>
            </div>
          </div>
        </div>

        {/* Reassign Modal */}
        {
          showReassignModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <div className="fixed inset-0 md:left-80 bg-black/40 transition-opacity" onClick={() => setShowReassignModal(false)}></div>
              <div className="relative w-full max-w-2xl md:ml-80 bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-fade-in-up overflow-hidden">

                {/* Modal Header */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 shrink-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-display font-bold text-eco-900">Assign Partner</h3>
                      <p className="text-sm text-eco-600 mt-1 flex items-center gap-1.5">
                        <Navigation size={14} className="text-tech-teal" />
                        Nearby partners for <span className="font-semibold text-gray-800">{selectedRequest?.pickupAddress?.split(',').slice(1).join(',')}</span>
                      </p>
                    </div>
                    <button onClick={() => setShowReassignModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Filters Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search partners by name..."
                        value={partnerSearch}
                        onChange={e => setPartnerSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50"
                      />
                    </div>
                    <div className="relative min-w-[140px]">
                      <select
                        value={maxDistance}
                        onChange={e => setMaxDistance(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 appearance-none text-gray-700"
                      >
                        <option value="All">Any Distance</option>
                        <option value="10">&lt; 10 miles</option>
                        <option value="25">&lt; 25 miles</option>
                        <option value="50">&lt; 50 miles</option>
                        <option value="100">&lt; 100 miles</option>
                      </select>
                      <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partners List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="space-y-3">
                    {filteredPartnersList.length > 0 ? (
                      filteredPartnersList.map((partner) => {
                        const isClosest = partner.distance < 10;
                        return (
                          <div
                            key={partner.id}
                            className={`
                              p-4 rounded-xl border transition-all flex items-center justify-between group
                              ${partner.name === selectedRequest?.facilityName
                                ? 'bg-eco-50 border-eco-200 ring-1 ring-eco-200'
                                : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'}
                            `}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                ${isClosest ? 'bg-tech-lime/30 text-eco-900' : 'bg-gray-100 text-gray-500'}
                              `}>
                                {partner.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900">{partner.name}</h4>
                                  {isClosest && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Nearby</span>}
                                  {partner.name === selectedRequest?.facilityName && <span className="text-[10px] font-bold bg-eco-100 text-eco-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1"><Building2 size={12} /> {partner.type}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <span className="flex items-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400" /> {partner.rating}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-2">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <MapPin size={14} className={isClosest ? 'text-green-500' : 'text-gray-400'} />
                                {partner.distance} miles
                              </div>
                              {partner.name !== selectedRequest?.facilityName ? (
                                <button
                                  onClick={() => handleAssignPartner(partner.id)}
                                  className="px-4 py-1.5 bg-eco-900 text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-eco-700 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  Assign
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-eco-700 uppercase tracking-wide px-3 py-1 bg-eco-100 rounded-lg">Assigned</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                        <Building2 size={32} className="mb-2 opacity-50" />
                        <p>No partners found matching these filters.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                  Showing {filteredPartnersList.length} certified partners in the network.
                </div>
              </div>
            </div>
          )
        }

        {/* Audit Log Modal */}
        {
          showAuditModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="fixed inset-0 md:left-80 bg-black/40 transition-opacity" onClick={() => setShowAuditModal(false)}></div>
              <div className="relative w-full max-w-3xl md:ml-80 bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-fade-in-up overflow-hidden">
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <History size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-eco-900">Audit Log</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm text-gray-500">System events for Request:</span>
                        <span className="font-mono font-bold text-eco-900 text-sm tracking-tight">{selectedRequest?.requestNumber}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowAuditModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                      <tr>
                        <th className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actor</th>
                        <th className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-8 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-4 text-sm font-mono text-gray-600 whitespace-nowrap">{new Date(log.changedAt).toLocaleString()}</td>
                          <td className="px-8 py-4 text-sm text-eco-900 font-medium">
                            <div className="flex flex-col">
                              <span>{log.changedByName || (log.changedBy ? `User-${log.changedBy.substring(0, 8)}` : 'System')}</span>
                              {log.changedByName && <span className="text-[10px] text-gray-400 font-mono italic">{log.changedBy}</span>}
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              {log.newStatus}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-sm text-gray-600">{log.comments || `Status changed from ${log.oldStatus || 'NONE'} to ${log.newStatus}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }

  // --- LIST VIEW RENDER ---
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-eco-950">Recycle Requests</h2>
          <p className="text-eco-600 mt-1">Manage incoming pickup requests and track status.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-eco-900 text-white rounded-xl text-sm font-medium hover:bg-eco-800 shadow-lg">
            Create New Request
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search request ID or name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
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
              {['All', 'CREATED', 'APPROVED', 'VERIFIED', 'RECYCLED', 'REJECTED', 'CANCELLED'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setPage(0);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterStatus === status ? 'bg-eco-50 text-eco-800 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {status === 'All' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Citizen</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Device</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Model</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Facility Name</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Lodge Date</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-right text-sm font-bold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-10 h-10 border-4 border-eco-200 border-t-eco-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium">Fetching recycle requests...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRequests.map((req) => {
                const lodgeDate = new Date(req.createdAt).toLocaleDateString();

                return (
                  <tr
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <span className="font-mono text-base font-semibold text-eco-900 group-hover:text-eco-700 transition-colors">{req.requestNumber}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-eco-50 flex items-center justify-center text-eco-700 font-bold text-sm">
                          {req.citizenName.substring(0, 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-eco-900 text-base">{req.citizenName}</div>
                          <div className="text-xs text-gray-500">{req.citizenEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2.5 text-base text-gray-700 font-medium">
                        <span className="text-gray-500">{getDeviceIcon(req.deviceType)}</span>
                        {req.deviceType}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base text-gray-800 font-medium max-w-[200px]">{req.deviceModel}</div>
                    </td>
                    <td className="px-6 py-5">
                      {req.facilityName ? (
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-blue-500" />
                          <span className="text-base text-gray-800 font-medium">{req.facilityName}</span>
                        </div>
                      ) : (
                        <span className="text-base text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base text-gray-800 font-medium">{lodgeDate}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                        req.fulfillmentType === 'PICKUP' 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {req.fulfillmentType}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(req.status)} w-fit`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium px-1">
                          {req.fulfillmentStatusDisplay}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2.5 rounded-lg text-gray-400 group-hover:text-eco-600 group-hover:bg-white transition-all">
                        <ChevronRight size={22} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedRequests.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No requests found matching your filters.
            </div>
          )}
        </div>

        {/* Pagination UI */}
        <div className="bg-white px-8 py-6 border-t border-gray-100 flex flex-row items-center justify-between rounded-b-[2rem] shadow-sm gap-4">
          <div className="flex flex-row items-center gap-4 flex-shrink-0">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap inline-block">
              Showing <span className="text-eco-900 font-bold inline-block">{paginatedRequests.length}</span> of <span className="text-eco-900 font-bold inline-block">{total}</span> results
            </span>
            <div className="h-4 w-[1px] bg-gray-200 flex-shrink-0"></div>
            <span className="text-sm font-medium text-gray-400 whitespace-nowrap inline-block">
              Page <span className="text-gray-900 font-bold inline-block">{page + 1}</span> of {Math.max(1, Math.ceil(total / pageSize))}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
              disabled={page === 0}
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${page === i ? 'bg-eco-900 text-white shadow-lg' : 'text-gray-400 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setPage(p => Math.min(Math.ceil(total / pageSize) - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-eco-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
              disabled={page >= Math.ceil(total / pageSize) - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};