import axios from "axios";
import { toast } from "react-toastify";

/**
 * ROLE_ROUTES
 * Central mapping for role-based navigation
 */
export const ROLE_ROUTES = {
    ADMIN: "/admin",
    INTERMEDIARY: "/intermediary",
    CITIZEN: "/citizen", // Or /citizen/home if preferred
    DEFAULT: "/"
} as const;

export type UserRole = keyof typeof ROLE_ROUTES;

/**
 * handleSessionExpired
 * Logic to clear session and redirect on session expiry
 */
export const handleSessionExpired = () => {
    toast.error("Session expired. Re-routing to login page...", {
        autoClose: 5000,
        position: "top-right",
    });

    if (typeof window !== "undefined") {
        localStorage.clear();
        // Redirect to the common sign-in page
        window.location.replace("/sign-in");
    }
};

/**
 * apiClient
 * Centralized axios instance with session expiry interceptors
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
            handleSessionExpired();
        }
        return response;
    },
    (error) => {
        if (
            error.response?.data?.message === 'SESSION_EXPIRED' ||
            error.response?.data?.error === 'SESSION_EXPIRED' ||
            error.message === 'SESSION_EXPIRED'
        ) {
            handleSessionExpired();
        }
        return Promise.reject(error);
    }
);

/**
 * authApi
 * Authentication related API calls
 */
export const authApi = {
    login: async (credentials: any) => {
        // Calling our internal Next.js API route which proxies to the backend
        const response = await apiClient.post("/api/auth/sign-in", credentials);
        return response.data;
    },
};
