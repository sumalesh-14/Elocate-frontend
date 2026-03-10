import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/elocate';

// Helper to get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Types
export interface PartnerRegistrationRequest {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
  registrationNumber: string;
  facilityName: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  contactNumber?: string;
  operatingHours?: string;
  state?: string;
  pincode?: string;
}

export interface AdminCreatePartnerRequest {
  fullName: string;
  email: string;
  temporaryPassword: string;
  mobileNumber: string;
  registrationNumber: string;
  facilityName: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  contactNumber?: string;
  operatingHours?: string;
  state?: string;
  pincode?: string;
  autoApprove?: boolean;
}

export interface PartnerApprovalRequest {
  approvalStatus: 'APPROVED' | 'REJECTED';
  remarks?: string;
  isVerified?: boolean;
}

export interface PartnerDashboardResponse {
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

export const partnerAuthApi = {
  // Partner self-registration
  register: async (data: PartnerRegistrationRequest) => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/partner-auth/register`, data);
    return response.data;
  },

  // Get partner dashboard
  getDashboard: async (userId: string): Promise<PartnerDashboardResponse> => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/partner-auth/dashboard`, {
      headers: {
        'X-User-Id': userId,
      },
    });
    return response.data;
  },

  // Update own facility
  updateOwnFacility: async (userId: string, data: any) => {
    const response = await axios.put(`${API_BASE_URL}/api/v1/partner-auth/facility`, data, {
      headers: {
        'X-User-Id': userId,
      },
    });
    return response.data;
  },

  // Admin creates partner
  adminCreatePartner: async (data: AdminCreatePartnerRequest) => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/partners/admin/create`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Admin approves/rejects partner
  approvePartner: async (id: string, data: PartnerApprovalRequest) => {
    const response = await axios.patch(`${API_BASE_URL}/api/v1/partners/${id}/approve`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // List partners by status
  listPartnersByStatus: async (status: string, page: number = 0, size: number = 10) => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/partners/by-status/${status}`, {
      params: { page, size },
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
