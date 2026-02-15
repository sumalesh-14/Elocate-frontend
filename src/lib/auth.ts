import axios from "axios";
import { toast } from "react-toastify";
import { getRefreshToken, setRefreshToken, setToken } from "@/app/citizen/sign-in/auth";

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
    async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();

            if (refreshToken) {
                try {
                    // Attempt to refresh token
                    const response = await authApi.refreshToken(refreshToken);
                    const { tokens } = response.data;

                    if (tokens && tokens.accessToken) {
                        // Update stored tokens
                        setToken(tokens.accessToken);
                        if (tokens.refreshToken) {
                            setRefreshToken(tokens.refreshToken);
                        }

                        // Update authorization header for the original request
                        // Assuming the token is moved to headers or handled by cookies/storage
                        // If your backend expects Bearer token in header:
                        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    handleSessionExpired();
                    return Promise.reject(refreshError);
                }
            } else {
                handleSessionExpired();
            }
        }

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
        return response;
    },
    register: async (credentials: any) => {
        // Calling our internal Next.js API route which proxies to the backend
        const response = await apiClient.post("/api/auth/register", credentials);
        return response;
    },
    forgotPassword: async (email: string) => {
        // Calling our internal Next.js API route which proxies to the backend
        const response = await apiClient.post("/api/auth/forgot-password", { email });
        return response;
    },
    verifyEmail: async (credentials: any) => {
        const response = await apiClient.post("/api/auth/verify-email", credentials);
        return response;
    },
    resendOtp: async (credentials: any) => {
        const response = await apiClient.post("/api/auth/resend-otp", credentials);
        return response;
    },
    refreshToken: async (token: string) => {
        const response = await apiClient.post("/api/auth/refresh", { refreshToken: token });
        return response;
    },
};
