import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface PartnerOnboardingRequest {
  registrationNumber: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  contactNumber?: string;
  operatingHours?: string;
  email?: string;
  state?: string;
  pincode?: string;
}

export interface PartnerResponse {
  id: string;
  registrationNumber: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  contactNumber: string;
  operatingHours: string;
  email: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerVerificationRequest {
  isVerified: boolean;
  remarks?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const partnerApi = {
  // Onboard a new partner
  onboardPartner: async (data: PartnerOnboardingRequest): Promise<PartnerResponse> => {
    const response = await axios.post(`${API_BASE_URL}/partners/onboard`, data);
    return response.data;
  },

  // List all partners with pagination and filters
  listPartners: async (
    page: number = 0,
    size: number = 10,
    search?: string,
    isVerified?: boolean
  ): Promise<PageResponse<PartnerResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) params.append('search', search);
    if (isVerified !== undefined) params.append('isVerified', isVerified.toString());
    
    const response = await axios.get(`${API_BASE_URL}/partners?${params.toString()}`);
    return response.data;
  },

  // Get partner by ID
  getPartnerById: async (id: string): Promise<PartnerResponse> => {
    const response = await axios.get(`${API_BASE_URL}/partners/${id}`);
    return response.data;
  },

  // Get partner by registration number
  getPartnerByRegistrationNumber: async (registrationNumber: string): Promise<PartnerResponse> => {
    const response = await axios.get(`${API_BASE_URL}/partners/registration/${registrationNumber}`);
    return response.data;
  },

  // Verify/unverify a partner
  verifyPartner: async (id: string, data: PartnerVerificationRequest): Promise<PartnerResponse> => {
    const response = await axios.patch(`${API_BASE_URL}/partners/${id}/verify`, data);
    return response.data;
  },

  // Update partner details
  updatePartner: async (id: string, data: PartnerOnboardingRequest): Promise<PartnerResponse> => {
    const response = await axios.put(`${API_BASE_URL}/partners/${id}`, data);
    return response.data;
  },

  // Delete a partner
  deletePartner: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/partners/${id}`);
  },
};
