import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

/**
 * adminApiClient
 * Centralized axios instance for admin API calls with automatic token refresh
 */
export const adminApiClient = axios.create({
    baseURL: "/api/v1", // Local Next.js API routes
    headers: {
        "Content-Type": "application/json",
    },
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Helper to get auth token
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper to check if token is expired or about to expire
const isTokenExpired = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    
    if (!token || !tokenTimestamp) return true;
    
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const currentTime = Date.now();
    const tokenAge = currentTime - parseInt(tokenTimestamp);
    
    // Refresh if token is older than 23 hours (1 hour before expiry)
    return tokenAge > (expirationTime - 60 * 60 * 1000);
};

// Function to refresh token
const refreshToken = async (): Promise<string | null> => {
    try {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        if (!currentRefreshToken) {
            console.error('❌ [TOKEN REFRESH] No refresh token found');
            return null;
        }

        console.log('🔄 [TOKEN REFRESH] Attempting to refresh token...');
        
        const response = await axios.post('/api/v1/auth/refresh', {
            refreshToken: currentRefreshToken
        });

        if (response.data && response.data.tokens) {
            const newAccessToken = response.data.tokens.accessToken;
            const newRefreshToken = response.data.tokens.refreshToken;
            
            localStorage.setItem('token', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('tokenTimestamp', Date.now().toString());
            
            console.log('✅ [TOKEN REFRESH] Token refreshed successfully');
            return newAccessToken;
        }
        
        return null;
    } catch (error) {
        console.error('❌ [TOKEN REFRESH] Failed to refresh token:', error);
        return null;
    }
};

// Request interceptor - add token and check expiry
adminApiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Check if token is expired or about to expire
        if (isTokenExpired() && !isRefreshing) {
            console.log('⚠️ [TOKEN] Token expired or about to expire, refreshing...');
            const newToken = await refreshToken();
            if (newToken && config.headers) {
                config.headers.Authorization = `Bearer ${newToken}`;
            }
        } else {
            // Add current token to request
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401/403 errors with token refresh
adminApiClient.interceptors.response.use(
    (response) => {
        const resData = response.data as any;
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
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 or 403 errors
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return adminApiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshToken();
                
                if (newToken) {
                    processQueue(null, newToken);
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return adminApiClient(originalRequest);
                } else {
                    // Refresh failed, logout user
                    processQueue(new Error('Token refresh failed'), null);
                    toast.error("Session expired. Please login again.", {
                        autoClose: 5000,
                        position: "top-right",
                    });
                    if (typeof window !== "undefined") {
                        localStorage.clear();
                        window.location.replace("/sign-in");
                    }
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                toast.error("Session expired. Please login again.", {
                    autoClose: 5000,
                    position: "top-right",
                });
                if (typeof window !== "undefined") {
                    localStorage.clear();
                    window.location.replace("/sign-in");
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other session expired messages
        const errorData = error.response?.data as any;
        if (
            errorData?.message === 'SESSION_EXPIRED' ||
            errorData?.error === 'SESSION_EXPIRED' ||
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
 * Device Categories API
 */
export const deviceCategoriesApi = {
    getAll: async (params?: { page?: number; size?: number; search?: string }) => {
        const response = await adminApiClient.get("/device-categories", {
            params,
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
        const response = await adminApiClient.post("/device-categories", categoryData, {
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
        const response = await adminApiClient.get("/device-brands", {
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
        const response = await adminApiClient.post("/device-brands", brandData, {
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
    getAll: async (params?: { page?: number; size?: number; search?: string; isActive?: boolean; categoryId?: string; brandId?: string }) => {
        const response = await adminApiClient.get("/device-models", {
            params,
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
        const response = await adminApiClient.post("/device-models", modelData, {
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

/**
 * Recycle Requests API
 */
export const recycleRequestApi = {
    create: async (userId: string, data: any) => {
        const response = await adminApiClient.post("/recycle-requests", data, {
            params: { userId },
            headers: getAuthHeaders(),
        });
        return response;
    },

    getByUserId: async (userId: string, status?: string, searchTerm?: string) => {
        const params: Record<string, string> = { userId };
        if (status && status !== 'all') params.status = status;
        if (searchTerm) params.searchTerm = searchTerm;
        const response = await adminApiClient.get("/recycle-requests", {
            params,
            headers: getAuthHeaders(),
        });
        return response;
    },

    getById: async (id: string) => {
        const response = await adminApiClient.get(`/recycle-requests/${id}`, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    updateFulfillmentStatus: async (id: string, data: { newStatus: string; changedBy: string }) => {
        const response = await adminApiClient.put(`/recycle-requests/${id}/fulfillment-status`, data, {
            headers: getAuthHeaders(),
        });
        return response;
    },

    getStatusHistory: async (id: string) => {
        const response = await adminApiClient.get(`/recycle-requests/${id}/status-history`, {
            headers: getAuthHeaders(),
        });
        return response;
    },
    
    sendReminder: async (id: string, userId: string, comment?: string) => {
        const response = await adminApiClient.post(`/recycle-requests/${id}/send-reminder`, 
            { comment: comment || 'Reminder: Please process this recycle request' },
            {
                params: { userId },
                headers: getAuthHeaders(),
            }
        );
        return response;
    },
    
    cancel: async (id: string, userId: string) => {
        const response = await adminApiClient.put(`/recycle-requests/${id}/cancel`, null, {
            params: { userId },
            headers: getAuthHeaders(),
        });
        return response;
    }
};

/**
 * User Profile API
 */
export const userProfileApi = {
    get: async () => {
        const response = await adminApiClient.get("/profile", {
            headers: getAuthHeaders(),
        });
        return response;
    },
    update: async (data: any) => {
        const response = await adminApiClient.put("/profile", data, {
            headers: getAuthHeaders(),
        });
        return response;
    }
};

