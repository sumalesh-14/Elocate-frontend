import axios from "axios";
import { toast } from "react-toastify";

/**
 * adminApiClient
 * Centralized axios instance for admin API calls
 */
export const adminApiClient = axios.create({
    baseURL: "/", // Local Next.js API routes
    headers: {
        "Content-Type": "application/json",
    },
});

adminApiClient.interceptors.response.use(
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

// Helper to get auth token
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Device Categories API
 */
export const deviceCategoriesApi = {
    getAll: async () => {
        const response = await adminApiClient.get("/api/device-categories", {
            headers: getAuthHeaders(),
        });
        return response;
    },

    getById: async (id: string | number) => {
        const response = await adminApiClient.get(`/api/device-categories/${id}`, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    create: async (categoryData: any) => {
        const response = await adminApiClient.post("/api/device-categories", categoryData, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    update: async (id: string | number, categoryData: any) => {
        const response = await adminApiClient.put(`/api/device-categories/${id}`, categoryData, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    delete: async (id: string | number) => {
        const response = await adminApiClient.delete(`/api/device-categories/${id}?action=delete-category`, {
            headers: getAuthHeaders(),
        });
        return response;
    },
};

/**
 * Device Brands API
 */
export const deviceBrandsApi = {
    getAll: async () => {
        const response = await adminApiClient.get("/api/device-brands", {
            headers: getAuthHeaders(),
        });
        return response;
    },

    getById: async (id: string | number) => {
        const response = await adminApiClient.get(`/api/device-brands/${id}`, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    create: async (brandData: any) => {
        const response = await adminApiClient.post("/api/device-brands", brandData, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    update: async (id: string | number, brandData: any) => {
        const response = await adminApiClient.put(`/api/device-brands/${id}`, brandData, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    delete: async (id: string | number) => {
        const response = await adminApiClient.delete(`/api/device-brands/${id}?action=delete-brand`, {
            headers: getAuthHeaders(),
        });
        return response;
    },
};

/**
 * Device Models API
 */
export const deviceModelsApi = {
    getAll: async () => {
        const response = await adminApiClient.get("/api/device-models", {
            headers: getAuthHeaders(),
        });
        return response;
    },

    getById: async (id: string | number) => {
        const response = await adminApiClient.get(`/api/device-models/${id}`, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    create: async (modelData: any) => {
        const response = await adminApiClient.post("/api/device-models", modelData, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    update: async (id: string | number, modelData: any) => {
        const response = await adminApiClient.put(`/api/device-models/${id}`, modelData, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    delete: async (id: string | number) => {
        const response = await adminApiClient.delete(`/api/device-models/${id}?action=delete-model`, {
            headers: getAuthHeaders(),
        });
        return response;
    },
};
