import axios from "axios";
import { toast } from "react-toastify";

/**
 * apiClient
 * Centralized axios instance for device brands API calls
 */
export const apiClient = axios.create({
    baseURL: "/", // Local Next.js API routes
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => {
        const resData = response.data;
        if (resData?.message === 'SESSION_EXPIRED' || resData?.error === 'SESSION_EXPIRED') {
            toast.error("Session expired. Re-routing to login page...", {
                autoClose: 5000,
                position: "top-right",
            });
            if (typeof window !== "undefined") {
                localStorage.clear();
                window.location.replace("/sign-in");
            }
        }
        return response;
    },
    (error) => {
        if (
            error.response?.data?.message === 'SESSION_EXPIRED' ||
            error.response?.data?.error === 'SESSION_EXPIRED' ||
            error.message === 'SESSION_EXPIRED'
        ) {
            toast.error("Session expired. Re-routing to login page...", {
                autoClose: 5000,
                position: "top-right",
            });
            if (typeof window !== "undefined") {
                localStorage.clear();
                window.location.replace("/sign-in");
            }
        }
        return Promise.reject(error);
    }
);

/**
 * deviceBrandsApi
 * Device Brands related API calls
 */
export const deviceBrandsApi = {
    // Get all device brands
    // getAll: async () => {
    //     const response = await apiClient.get("/api/device-brands");
    //     return response;
    // },

    // // Get device brand by ID
    // getById: async (id: string | number) => {
    //     const response = await apiClient.get(`/api/device-brands/${id}`);
    //     return response;
    // },

    // // Create new device brand
    // create: async (brandData: any) => {
    //     const response = await apiClient.post("/api/device-brands", brandData);
    //     return response;
    // },

    // // Update device brand by ID
    // update: async (id: string | number, brandData: any) => {
    //     const response = await apiClient.put(`/api/device-brands/${id}`, brandData);
    //     return response;
    // },

    // Delete device brand by ID
    delete: async (id: string | number) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await apiClient.delete(`/api/device-brands/${id}`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        return response;
    },

    // Search device brands
    // search: async (query: string) => {
    //     const response = await apiClient.get(`/api/device-brands/search?q=${query}`);
    //     return response;
    // },

    // // Get device brands by status
    // getByStatus: async (status: string) => {
    //     const response = await apiClient.get(`/api/device-brands/status/${status}`);
    //     return response;
    // },
};
