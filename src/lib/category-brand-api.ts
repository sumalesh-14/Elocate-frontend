import axios from "axios";
import { toast } from "react-toastify";

/**
 * categoryBrandApiClient
 * API client for category-brand associations
 */
export const categoryBrandApiClient = axios.create({
    baseURL: "/",
    headers: {
        "Content-Type": "application/json",
    },
});

categoryBrandApiClient.interceptors.response.use(
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
 * Category-Brand Association API
 */
export const categoryBrandApi = {
    // Get all associations
    getAll: async (page = 0, size = 10) => {
        const response = await categoryBrandApiClient.get("/api/category-brands", {
            params: { page, size },
            headers: getAuthHeaders(),
        });
        return response;
    },

    // Get brands for a specific category
    getBrandsByCategory: async (categoryId: string, page = 0, size = 10) => {
        const response = await categoryBrandApiClient.get(`/api/category-brands/category/${categoryId}`, {
            params: { page, size },
            headers: getAuthHeaders(),
        });
        return response;
    },

    // Get categories for a specific brand
    getCategoriesByBrand: async (brandId: string, page = 0, size = 10) => {
        const response = await categoryBrandApiClient.get(`/api/category-brands/brand/${brandId}`, {
            params: { page, size },
            headers: getAuthHeaders(),
        });
        return response;
    },

    // Create new association
    create: async (data: { categoryId: string; brandId: string; isActive?: boolean }) => {
        const response = await categoryBrandApiClient.post("/api/category-brands", data, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    // Delete association
    delete: async (id: string) => {
        const response = await categoryBrandApiClient.delete(`/api/category-brands/${id}`, {
            headers: getAuthHeaders(),
        });
        return response;
    },
};
