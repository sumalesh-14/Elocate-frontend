'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, X, Truck, 
  MapPin, Calendar, Smartphone, User, FileText, 
  AlertCircle, ChevronRight, Laptop, Printer, Tv, Headphones,
  ArrowLeft, MessageSquare, Star, UserCheck,
  Building2, Navigation, Sliders, Bell, History, Shield
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// --- Types ---

type RequestStatus = 'Pending' | 'Scheduled' | 'Picked Up' | 'In Progress' | 'Completed' | 'Cancelled';

interface TimelineEvent {
  step: string;
  date: string;
  completed: boolean;
  description?: string;
}

interface RecycleRequest {
  id: string;
  citizenName: string;
  citizenEmail: string;
  deviceType: 'Smartphone' | 'Laptop' | 'Printer' | 'Television' | 'Audio';
  deviceModel: string;
  condition: string;
  pickupAddress: string;
  pickupDate: string;
  pickupTime: string;
  status: RequestStatus;
  assignedPartner?: string;
  description?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  timeline: TimelineEvent[];
}

interface PartnerMock {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

// --- Mock Data ---

const MOCK_PARTNERS: PartnerMock[] = [
  { id: 'PRT-006', name: 'BlueSky Logistics', type: 'Collector', location: 'Portland, OR', rating: 4.9 },
  { id: 'PRT-001', name: 'GreenLoop Recycling', type: 'Processor', location: 'Seattle, WA', rating: 4.8 },
  { id: 'PRT-007', name: 'Cascadia E-Cycle', type: 'Refurbisher', location: 'Portland, OR', rating: 4.6 },
  { id: 'PRT-008', name: 'Bay Area Recyclers', type: 'Processor', location: 'San Francisco, CA', rating: 4.7 },
  { id: 'PRT-002', name: 'Urban E-Waste', type: 'Collector', location: 'Austin, TX', rating: 4.5 },
  { id: 'PRT-003', name: 'TechSalvage Inc', type: 'Refurbisher', location: 'Boston, MA', rating: 3.9 },
  { id: 'PRT-004', name: 'EcoParts Wholesale', type: 'Processor', location: 'Denver, CO', rating: 4.7 },
  { id: 'PRT-005', name: 'Rapid Recycle', type: 'Collector', location: 'Miami, FL', rating: 4.2 },
];

const MOCK_REQUESTS: RecycleRequest[] = [
  {
    id: 'REQ-2024-8821',
    citizenName: 'Alex Johnson',
    citizenEmail: 'alex.j@example.com',
    deviceType: 'Smartphone',
    deviceModel: 'iPhone 12 Pro (Cracked Screen)',
    condition: 'Broken',
    pickupAddress: '1234 Eco Lane, Portland, OR 97204',
    pickupDate: '2024-10-28',
    pickupTime: '09:00 AM - 11:00 AM',
    status: 'Pending',
    description: "The screen is shattered and the battery doesn't hold a charge anymore. I've wiped the data but it doesn't turn on.",
    timeline: [
      { step: 'Request Submitted', date: '2024-10-24 14:30', completed: true, description: 'User submitted request via mobile app.' },
      { step: 'Partner Assigned', date: '', completed: false, description: 'Waiting for partner acceptance.' },
      { step: 'Pickup Scheduled', date: '', completed: false },
      { step: 'Recycling Processed', date: '', completed: false },
    ]
  },
  {
    id: 'REQ-2024-8820',
    citizenName: 'Maria Garcia',
    citizenEmail: 'm.garcia@example.com',
    deviceType: 'Laptop',
    deviceModel: 'MacBook Pro 2019',
    condition: 'Working',
    pickupAddress: '789 Pine St, Seattle, WA 98101',
    pickupDate: '2024-10-26',
    pickupTime: '01:00 PM - 03:00 PM',
    status: 'Picked Up',
    assignedPartner: 'GreenLoop Recycling',
    description: "Old work laptop. It works fine but runs very slow. Charger included.",
    timeline: [
      { step: 'Request Submitted', date: '2024-10-22 09:15', completed: true },
      { step: 'Partner Assigned', date: '2024-10-22 10:45', completed: true, description: 'GreenLoop Recycling accepted the request.' },
      { step: 'Pickup Completed', date: '2024-10-26 14:20', completed: true, description: 'Driver confirmed pickup.' },
      { step: 'Recycling Processed', date: '', completed: false },
    ]
  },
  {
    id: 'REQ-2024-8815',
    citizenName: 'David Kim',
    citizenEmail: 'dkim@test.com',
    deviceType: 'Television',
    deviceModel: 'Sony Bravia 55"',
    condition: 'Working',
    pickupAddress: '456 Oak Ave, San Francisco, CA 94110',
    pickupDate: '2024-10-20',
    pickupTime: '10:00 AM',
    status: 'Completed',
    assignedPartner: 'Urban E-Waste',
    description: "Upgraded to a new TV. This one is fully functional, just bulky. Includes remote.",
    feedback: { rating: 5, comment: 'Super fast and easy service! Loved the tracking.' },
    timeline: [
      { step: 'Request Submitted', date: '2024-10-18 11:00', completed: true },
      { step: 'Partner Assigned', date: '2024-10-18 13:20', completed: true },
      { step: 'Pickup Completed', date: '2024-10-20 10:15', completed: true },
      { step: 'Recycling Processed', date: '2024-10-21 09:00', completed: true, description: 'Materials separated: Glass, Plastic, Copper.' },
    ]
  }
];

export const RecycleRequests: React.FC = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RecycleRequest[]>(MOCK_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // View State
  const [selectedRequest, setSelectedRequest] = useState<RecycleRequest | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

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
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Picked Up': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getSimulatedDistance = (partnerLoc: string, address: string): number => {
    // Naive distance simulation based on string matching
    if (!partnerLoc || !address) return 0;

    const pLoc = partnerLoc.toLowerCase();
    const cAddr = address.toLowerCase();
    
    // Extract city from partner loc (e.g., "Seattle" from "Seattle, WA")
    const partnerCity = pLoc.split(',')[0].trim();
    const partnerState = pLoc.split(',')[1]?.trim();

    if (cAddr.includes(partnerCity)) return Number((Math.random() * 5 + 1).toFixed(1)); // 1-6 miles
    if (partnerState && cAddr.includes(partnerState)) return Number((Math.random() * 50 + 10).toFixed(1)); // 10-60 miles
    
    return Number((Math.random() * 500 + 100).toFixed(1)); // >100 miles
  };

  const handleAssignPartner = (partnerName: string) => {
    if (!selectedRequest) return;
    
    const updated = { 
      ...selectedRequest, 
      assignedPartner: partnerName,
      status: 'Scheduled' as RequestStatus,
      timeline: [
        ...selectedRequest.timeline,
        { 
          step: 'Partner Assigned', 
          date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          completed: true, 
          description: `Assigned to ${partnerName} for pickup.` 
        }
      ]
    };
    
    // Update list
    setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updated : r));
    // Update current view
    setSelectedRequest(updated);
    
    setShowReassignModal(false);
    showToast(`Request successfully reassigned to ${partnerName}.`, 'success');
  };

  const handleSendReminder = () => {
    if (!selectedRequest?.assignedPartner) return;
    
    showToast(
      `Reminder sent to ${selectedRequest.assignedPartner}.\nAsking them to confirm pickup for Request ${selectedRequest.id}.`, 
      'info'
    );
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.citizenName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate filtered and sorted partners
  const getFilteredPartners = () => {
     if (!selectedRequest) return [];
     
     return MOCK_PARTNERS.map(p => ({
        ...p,
        distance: getSimulatedDistance(p.location, selectedRequest.pickupAddress)
      }))
      .filter(p => {
        const matchesName = p.name.toLowerCase().includes(partnerSearch.toLowerCase());
        const distanceVal = maxDistance === 'All' ? Infinity : Number(maxDistance);
        const matchesDistance = p.distance <= distanceVal;
        return matchesName && matchesDistance;
      })
      .sort((a, b) => a.distance - b.distance);
  };
  
  const filteredPartnersList = getFilteredPartners();

  // Mock Audit Log Data Generator
  const getAuditLog = (reqId: string): AuditLogEntry[] => [
    { id: 'LOG-001', timestamp: '2024-10-24 14:30:05', actor: 'System', action: 'Request Created', details: 'Request received via Mobile App v2.4' },
    { id: 'LOG-002', timestamp: '2024-10-24 14:30:10', actor: 'System', action: 'Auto-Triage', details: 'Categorized as "Smartphone" - Priority Normal' },
    { id: 'LOG-003', timestamp: '2024-10-24 16:15:00', actor: 'Admin User', action: 'Viewed Details', details: 'Admin viewed request details' },
  ];

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
            <p className="text-gray-500 text-sm">ID: <span className="font-mono">{selectedRequest.id}</span></p>
          </div>
          
          <div className="ml-auto">
            <button 
                onClick={() => {
                  setPartnerSearch('');
                  setMaxDistance('All');
                  setShowReassignModal(true);
                }}
                className="px-5 py-2.5 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 shadow-lg transition-colors flex items-center gap-2"
              >
                <UserCheck size={18} /> 
                {selectedRequest.assignedPartner ? 'Reassign Partner' : 'Assign Partner'}
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
                        {selectedRequest.timeline?.[0]?.date.split(' ')[0] || 'N/A'}
                      </div>
                    </div>
                </div>

                {/* Description Field */}
                {selectedRequest.description && (
                  <div className="mb-8 p-5 bg-gray-50/80 border border-gray-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText size={14} /> Description
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedRequest.description}
                    </p>
                  </div>
                )}

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
                            <span className="leading-relaxed">{selectedRequest.pickupAddress}</span>
                          </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Truck size={16} /> Pickup Logistics
                      </h4>
                      <div className="space-y-4">
                          <div className="bg-eco-50 rounded-xl p-4 border border-eco-100">
                            <div className="text-xs text-eco-600 font-medium mb-1">Scheduled Date</div>
                            <div className="font-bold text-eco-900">{selectedRequest.pickupDate}</div>
                            <div className="text-sm text-eco-700 mt-1">{selectedRequest.pickupTime}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-2">Assigned Partner</div>
                            {selectedRequest.assignedPartner ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 font-medium text-eco-900">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">P</div>
                                    {selectedRequest.assignedPartner}
                                </div>
                                <button 
                                  onClick={handleSendReminder}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Bell size={12} /> Send Reminder
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-orange-500 flex items-center gap-1 font-medium italic">
                                <AlertCircle size={14} /> No partner assigned yet
                              </div>
                            )}
                          </div>
                      </div>
                    </div>
                </div>
              </div>

              {/* Feedback Section (if complete) */}
              {selectedRequest.feedback && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-[2rem] border border-orange-100 p-8">
                  <h3 className="font-display font-bold text-lg text-orange-900 mb-4 flex items-center gap-2">
                    <Star size={20} className="fill-orange-400 text-orange-400" /> Citizen Feedback
                  </h3>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} className={`${i < (selectedRequest.feedback?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-gray-700 italic">"{selectedRequest.feedback.comment}"</p>
                  </div>
                </div>
              )}
          </div>

          {/* Right Column: Timeline */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 h-fit">
              <h3 className="font-display font-bold text-xl text-eco-900 mb-6">Request Timeline</h3>
              
              <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {selectedRequest.timeline?.map((event, idx) => (
                    <div key={idx} className="relative flex gap-4 group">
                      <div className={`
                        relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-white
                        ${event.completed ? 'border-eco-500 text-eco-500' : 'border-gray-200 text-gray-300'}
                      `}>
                          <div className={`w-2 h-2 rounded-full ${event.completed ? 'bg-eco-500' : 'bg-transparent'}`}></div>
                      </div>
                      <div className={`${event.completed ? 'opacity-100' : 'opacity-50'}`}>
                          <div className="font-bold text-sm text-gray-900">{event.step}</div>
                          {event.date && <div className="text-xs text-gray-500 mt-0.5 font-mono">{event.date}</div>}
                          {event.description && <div className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">{event.description}</div>}
                      </div>
                    </div>
                ))}
              </div>

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
        {showReassignModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowReassignModal(false)}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-fade-in-up overflow-hidden">
               
               {/* Modal Header */}
               <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 shrink-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-display font-bold text-eco-900">Assign Partner</h3>
                      <p className="text-sm text-eco-600 mt-1 flex items-center gap-1.5">
                        <Navigation size={14} className="text-tech-teal" /> 
                        Nearby partners for <span className="font-semibold text-gray-800">{selectedRequest.pickupAddress.split(',').slice(1).join(',')}</span>
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
                              ${partner.name === selectedRequest.assignedPartner 
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
                                    {partner.name === selectedRequest.assignedPartner && <span className="text-[10px] font-bold bg-eco-100 text-eco-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1"><Building2 size={12}/> {partner.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span className="flex items-center gap-1"><Star size={12} className="fill-yellow-400 text-yellow-400"/> {partner.rating}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-2">
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                  <MapPin size={14} className={isClosest ? 'text-green-500' : 'text-gray-400'} />
                                  {partner.distance} miles
                              </div>
                              {partner.name !== selectedRequest.assignedPartner ? (
                                <button 
                                  onClick={() => handleAssignPartner(partner.name)}
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
                        <Building2 size={32} className="mb-2 opacity-50"/>
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
        )}

        {/* Audit Log Modal */}
        {showAuditModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowAuditModal(false)}></div>
             <div className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-fade-in-up overflow-hidden">
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <History size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-bold text-eco-900">Audit Log</h3>
                        <p className="text-sm text-gray-500">System events for Request <span className="font-mono">{selectedRequest.id}</span></p>
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
                         {getAuditLog(selectedRequest.id).map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                               <td className="px-8 py-4 text-sm font-mono text-gray-600 whitespace-nowrap">{log.timestamp}</td>
                               <td className="px-8 py-4 text-sm text-eco-900 font-medium">{log.actor}</td>
                               <td className="px-8 py-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {log.action}
                                  </span>
                               </td>
                               <td className="px-8 py-4 text-sm text-gray-600">{log.details}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                   <Shield size={12} /> Immutable record stored on secure ledger.
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
              {['All', 'Pending', 'Scheduled', 'Picked Up', 'Completed'].map(status => (
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
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Pickup Date</th>
                <th className="px-6 py-5 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-right text-sm font-bold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => {
                // Extract lodge date from timeline
                const lodgeDate = req.timeline?.[0]?.date ? req.timeline[0].date.split(' ')[0] : 'N/A';
                
                return (
                  <tr 
                    key={req.id} 
                    onClick={() => setSelectedRequest(req)}
                    className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <span className="font-mono text-base font-semibold text-eco-900 group-hover:text-eco-700 transition-colors">{req.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-eco-50 flex items-center justify-center text-eco-700 font-bold text-sm">
                          {req.citizenName.substring(0, 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-eco-900 text-base">{req.citizenName}</div>
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
                      {req.assignedPartner ? (
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-blue-500" />
                          <span className="text-base text-gray-800 font-medium">{req.assignedPartner}</span>
                        </div>
                      ) : (
                        <span className="text-base text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base text-gray-800 font-medium">{lodgeDate}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-base text-gray-900 font-medium">{req.pickupDate}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{req.pickupTime}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide border ${getStatusColor(req.status)}`}>
                         {req.status}
                      </span>
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
          
          {filteredRequests.length === 0 && (
            <div className="p-12 text-center text-gray-500">
               No requests found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};