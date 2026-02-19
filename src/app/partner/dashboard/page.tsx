'use client';

import { useState, useEffect } from 'react';
import { partnerAuthApi } from '@/lib/partner-auth-api';
import { 
  Building2, MapPin, Phone, Mail, Clock, Package, 
  CheckCircle, XCircle, AlertCircle, TrendingUp 
} from 'lucide-react';

interface DashboardData {
  facilityId: string;
  registrationNumber: string;
  facilityName: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  contactNumber: string;
  operatingHours: string;
  email: string;
  state: string;
  pincode: string;
  approvalStatus: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  userId: string;
  fullName: string;
  mobileNumber: string;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
}

export default function PartnerDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // TODO: Get userId from your auth context/session
      const userId = 'get-from-auth'; // Replace with actual user ID
      const data = await partnerAuthApi.getDashboard(userId);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No dashboard data available</div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const status = dashboard.approvalStatus;
    const styles = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const config = styles[status as keyof typeof styles] || styles.PENDING;
    const Icon = config.icon;

    return (
      <div className={`${config.bg} ${config.text} px-4 py-2 rounded-lg flex items-center gap-2`}>
        <Icon size={20} />
        <span className="font-semibold">{status}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {dashboard.facilityName}
              </h1>
              <p className="text-gray-600">Welcome back, {dashboard.fullName}</p>
            </div>
            {getStatusBadge()}
          </div>

          {dashboard.approvalStatus === 'PENDING' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle size={20} />
                <span className="font-semibold">Pending Approval</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Your account is awaiting admin approval. You'll be notified once approved.
              </p>
            </div>
          )}

          {dashboard.approvalStatus === 'REJECTED' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle size={20} />
                <span className="font-semibold">Account Rejected</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Your account application was not approved. Please contact support for more information.
              </p>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Requests"
            value={dashboard.totalRequests}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Pending"
            value={dashboard.pendingRequests}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={dashboard.completedRequests}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Rejected"
            value={dashboard.rejectedRequests}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Facility Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Facility Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem icon={Building2} label="Registration Number" value={dashboard.registrationNumber} />
            <InfoItem icon={Mail} label="Email" value={dashboard.email} />
            <InfoItem icon={Phone} label="Contact Number" value={dashboard.contactNumber} />
            <InfoItem icon={Phone} label="Mobile Number" value={dashboard.mobileNumber} />
            <InfoItem icon={MapPin} label="Address" value={dashboard.address} />
            <InfoItem icon={MapPin} label="State" value={dashboard.state} />
            <InfoItem icon={MapPin} label="Pincode" value={dashboard.pincode} />
            <InfoItem icon={Clock} label="Operating Hours" value={dashboard.operatingHours} />
            <InfoItem icon={Package} label="Daily Capacity" value={`${dashboard.capacity} kg`} />
            <InfoItem 
              icon={CheckCircle} 
              label="Verified" 
              value={dashboard.isVerified ? 'Yes' : 'No'} 
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Latitude</p>
              <p className="text-lg font-semibold">{dashboard.latitude}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Longitude</p>
              <p className="text-lg font-semibold">{dashboard.longitude}</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href={`https://www.google.com/maps?q=${dashboard.latitude},${dashboard.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-eco-600 hover:text-eco-700 font-semibold"
            >
              View on Google Maps →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color as keyof typeof colors]} flex items-center justify-center mb-4`}>
        <Icon size={24} />
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-eco-600 mt-1">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
