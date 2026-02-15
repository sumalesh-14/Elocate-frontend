'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Mail, Ban, CheckCircle, MapPin, User, Send, X, Shield, Download, Eye, Edit2, Save } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface Citizen {
  id: string;
  name: string;
  email: string;
  location: string;
  joinDate: string;
  impactPoints: number;
  status: 'Active' | 'Suspended';
}

export const CitizenManagement: React.FC = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Suspended'>('All');
  
  // Modal States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditingCitizen, setIsEditingCitizen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);

  // Mock Data
  const [citizens, setCitizens] = useState<Citizen[]>([
    { id: 'CTZ-001', name: 'Alex Johnson', email: 'alex.j@example.com', location: 'Portland, OR', joinDate: '2023-11-12', impactPoints: 1250, status: 'Active' },
    { id: 'CTZ-002', name: 'Maria Garcia', email: 'm.garcia@example.com', location: 'Austin, TX', joinDate: '2024-01-05', impactPoints: 850, status: 'Active' },
    { id: 'CTZ-003', name: 'John Smith', email: 'john.smith@test.com', location: 'Seattle, WA', joinDate: '2023-09-20', impactPoints: 420, status: 'Suspended' },
    { id: 'CTZ-004', name: 'Emily Chen', email: 'echen@example.com', location: 'San Francisco, CA', joinDate: '2024-02-14', impactPoints: 2100, status: 'Active' },
    { id: 'CTZ-005', name: 'David Kim', email: 'dkim@example.com', location: 'New York, NY', joinDate: '2023-12-01', impactPoints: 150, status: 'Active' },
  ]);

  const handleStatusToggle = (id: string) => {
    const citizen = citizens.find(c => c.id === id);
    if (!citizen) return;
    
    const newStatus = citizen.status === 'Active' ? 'Suspended' : 'Active';
    
    if (newStatus === 'Suspended' && !window.confirm(`Are you sure you want to suspend ${citizen.name}?`)) {
        return;
    }

    setCitizens(citizens.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
    showToast(`User ${citizen.name} has been ${newStatus.toLowerCase()}.`, newStatus === 'Active' ? 'success' : 'info');
  };

  const handleOpenEmail = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setShowEmailModal(true);
  };

  const handleOpenDetails = (citizen: Citizen) => {
    setSelectedCitizen({ ...citizen });
    setIsEditingCitizen(false);
    setShowDetailsModal(true);
  };

  const handleSaveCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCitizen) {
        setCitizens(citizens.map(c => c.id === selectedCitizen.id ? selectedCitizen : c));
        showToast('Citizen details updated successfully.');
        setIsEditingCitizen(false);
    }
  };

  const handleSendEmail = () => {
    if (!selectedCitizen) return;
    
    // Simulate API
    const btn = document.getElementById('sendBtn');
    if (btn) btn.innerText = 'Sending...';
    
    setTimeout(() => {
        setShowEmailModal(false);
        showToast(`Email sent to ${selectedCitizen.name} successfully!`);
    }, 1000);
  };

  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (filteredCitizens.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Location', 'Join Date', 'Impact Points', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredCitizens.map(c => [
        c.id,
        `"${c.name}"`,
        c.email,
        `"${c.location}"`,
        c.joinDate,
        c.impactPoints,
        c.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `citizens_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Citizens data exported successfully!');
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-eco-950">Citizen Management</h2>
          <p className="text-eco-600 mt-1">Manage registered users, track impact, and handle account status.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleExportCSV}
             className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
           >
             <Download size={16} />
             Export CSV
           </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Search citizens..."
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

      {/* Citizens List */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Impact Score</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCitizens.map((citizen) => (
                <tr key={citizen.id} className="group hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {citizen.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-eco-900">{citizen.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          {citizen.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      {citizen.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{citizen.joinDate}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                       ${citizen.status === 'Active' 
                         ? 'bg-green-50 text-green-700 border-green-100' 
                         : 'bg-red-50 text-red-700 border-red-100'}`}>
                       {citizen.status === 'Active' ? <CheckCircle size={12} className="mr-1"/> : <Ban size={12} className="mr-1"/>}
                       {citizen.status}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-tech-teal">{citizen.impactPoints}</span>
                       <span className="text-xs text-gray-400">pts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenDetails(citizen)}
                        className="p-2 text-eco-600 hover:bg-eco-50 rounded-lg transition-colors tooltip"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenEmail(citizen)}
                        className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors tooltip"
                        title="Send Email"
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        onClick={() => handleStatusToggle(citizen.id)}
                        className={`p-2 rounded-lg transition-colors tooltip ${
                          citizen.status === 'Active' 
                            ? 'text-gray-500 hover:bg-red-50 hover:text-red-600' 
                            : 'text-red-500 hover:bg-green-50 hover:text-green-600'
                        }`}
                        title={citizen.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {citizen.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCitizens.length === 0 && (
            <div className="p-12 text-center text-gray-500">
               No citizens found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCitizen && (
         <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up">
             
             {/* Header */}
             <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-eco-900">Citizen Details</h3>
                  <p className="text-sm text-gray-500 mt-1">
                     ID: <span className="font-mono">{selectedCitizen.id}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditingCitizen(!isEditingCitizen)}
                    className={`p-2 rounded-full transition-colors ${isEditingCitizen ? 'bg-blue-100 text-blue-600' : 'text-blue-600 hover:bg-blue-50'}`}
                    title="Edit Record"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
             </div>

             {/* Content */}
             <form onSubmit={handleSaveCitizen} className="p-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={selectedCitizen.name} 
                    disabled={!isEditingCitizen}
                    onChange={(e) => setSelectedCitizen({ ...selectedCitizen, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={selectedCitizen.email} 
                    disabled={!isEditingCitizen}
                    onChange={(e) => setSelectedCitizen({ ...selectedCitizen, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Location</label>
                   <input 
                     type="text" 
                     value={selectedCitizen.location} 
                     disabled={!isEditingCitizen}
                     onChange={(e) => setSelectedCitizen({ ...selectedCitizen, location: e.target.value })}
                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Join Date</label>
                      <input 
                        type="text" 
                        value={selectedCitizen.joinDate} 
                        disabled={true} // Usually can't edit join date
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Impact Points</label>
                      <input 
                        type="number" 
                        value={selectedCitizen.impactPoints} 
                        disabled={!isEditingCitizen}
                        onChange={(e) => setSelectedCitizen({ ...selectedCitizen, impactPoints: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                   </div>
                </div>

                {isEditingCitizen && (
                   <div className="pt-4 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingCitizen(false)}
                        className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-3 bg-eco-900 text-white rounded-xl font-medium hover:bg-eco-800 flex items-center justify-center gap-2"
                      >
                        <Save size={18} /> Save Changes
                      </button>
                   </div>
                )}
             </form>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedCitizen && (
        <div className="fixed inset-0 md:left-72 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity" onClick={() => setShowEmailModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-eco-900 flex items-center gap-2">
                <Mail size={18} className="text-eco-600" />
                Message {selectedCitizen.name}
              </h3>
              <button onClick={() => setShowEmailModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient</label>
                 <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                   {selectedCitizen.name} &lt;{selectedCitizen.email}&gt;
                 </div>
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                 <input 
                   type="text" 
                   defaultValue="Important: Account Update" 
                   className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-sm"
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Message</label>
                 <textarea 
                   rows={5}
                   className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-tech-lime/50 text-sm resize-none"
                   placeholder="Type your message here..."
                 ></textarea>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                id="sendBtn"
                className="px-6 py-2 bg-eco-900 text-white rounded-xl text-sm font-medium hover:bg-eco-800 transition-colors flex items-center gap-2"
              >
                <Send size={16} /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
