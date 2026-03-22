import { getToken } from "@/app/intermediary/sign-in/auth";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1`;

console.log("Intermediary Driver Module - Target Backend URL:", BASE_URL);

/**
 * Resolves the facilityId for the current intermediary user.
 * Returns from localStorage if cached, otherwise fetches from backend and caches it.
 */
export async function resolveFacilityId(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    // 1. Direct cache (set at login time)
    const cached = localStorage.getItem("facilityId");
    if (cached) return cached;

    // 2. Parse from stored login response — handles both shapes:
    //    Shape A (flat): { id, fullName, facilityId, ... }
    //    Shape B (nested): { status, user: { facilityId }, tokens }
    try {
        const raw = localStorage.getItem("user");
        if (raw) {
            const parsed = JSON.parse(raw);
            const facilityId = parsed?.facilityId ?? parsed?.user?.facilityId;
            if (facilityId) {
                localStorage.setItem("facilityId", facilityId);
                return facilityId;
            }
        }
    } catch (e) { /* ignore */ }

    console.warn("[resolveFacilityId] facilityId not found — please log out and log back in");
    return null;
}

const getHeaders = (contentType: string = "application/json") => {
    const headers: Record<string, string> = {};
    if (contentType) headers["Content-Type"] = contentType;

    // --- TOKEN DEBUG LOGS ---
    const cookieRaw = typeof document !== 'undefined' ? document.cookie : 'SSR - no document';
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : 'SSR - no window';
    const localStorageAccessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : 'SSR - no window';
    const tokenFromHelper = getToken();

    console.group('[intermediary-api] 🔐 Token Debug');
    console.log('1. document.cookie (raw)       :', cookieRaw);
    console.log('2. localStorage["token"]       :', localStorageToken ?? 'NULL');
    console.log('3. localStorage["accessToken"] :', localStorageAccessToken ?? 'NULL');
    console.log('4. getToken() result            :', tokenFromHelper ? `${tokenFromHelper.substring(0, 40)}...` : 'NULL ❌');
    console.log('5. Token source being used      :', tokenFromHelper ? 'getToken() ✅' : 'NONE - will be unauthorized ❌');
    console.groupEnd();
    // --- END DEBUG LOGS ---

    if (tokenFromHelper) {
        headers["Authorization"] = `Bearer ${tokenFromHelper}`;
    } else {
        console.error("[intermediary-api] ❌ No token found anywhere. Request will be 401 Unauthorized.");
    }

    return headers;
};

export interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    vehicleNumber: string;
    availability: string;
    vehicleType: string;
    facilityId?: string;
}

export interface DriverRequest {
    name: string;
    email: string;
    phone: string;
    vehicleNumber: string;
    availability?: string;
    vehicleType?: string;
    facilityId?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const intermediaryApi = {
    // Driver Management
    drivers: {
        getAll: async (search?: string, availability?: string, page: number = 0, size: number = 8, facilityId?: string): Promise<PageResponse<Driver>> => {
            let url = `${BASE_URL}/drivers?page=${page}&size=${size}&`;
            if (facilityId) url += `facilityId=${encodeURIComponent(facilityId)}&`;
            if (search) url += `search=${encodeURIComponent(search)}&`;
            if (availability && availability !== "All") url += `availability=${encodeURIComponent(availability)}`;

            const finalUrl = url.replace(/[?&]$/, '');
            const response = await fetch(finalUrl, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch drivers");
            return response.json();
        },

        getById: async (id: string): Promise<Driver> => {
            const response = await fetch(`${BASE_URL}/drivers/${id}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch driver details");
            return response.json();
        },

        create: async (driver: DriverRequest): Promise<Driver> => {
            const response = await fetch(`${BASE_URL}/drivers`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(driver),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create driver");
            }
            return response.json();
        },

        update: async (id: string, driver: Partial<DriverRequest>): Promise<Driver> => {
            const response = await fetch(`${BASE_URL}/drivers/${id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(driver),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update driver");
            }
            return response.json();
        },

        delete: async (id: string): Promise<void> => {
            const url = `${BASE_URL}/drivers/${id}`;
            console.log("Calling Delete API:", url);
            const response = await fetch(url, {
                method: "DELETE",
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to delete driver");
        },
    },

    // Recycle Requests (For the intermediary flow)
    requests: {
        getAll: async (userId: string, status?: string, search?: string): Promise<any> => {
            let url = `${BASE_URL}/intermediary/recycle-requests?userId=${userId}&`;
            if (status && status !== "All") url += `status=${encodeURIComponent(status)}&`;
            if (search) url += `search=${encodeURIComponent(search)}&`;

            const finalUrl = url.replace(/[?&]$/, '');
            const token = localStorage.getItem('token');
            console.log("Fetching collections, token:", token ? token.substring(0, 20) + "..." : "NULL");
            console.log("URL:", finalUrl);
            const response = await fetch(finalUrl, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch requests");
            return response.json();
        },

        getById: async (id: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch request details");
            return response.json();
        },

        approve: async (id: string, payload: { adjustedEstimatedAmount: number, adjustmentReason: string, aiPricingResponse?: any }): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}/approve`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to approve request");
            return response.json();
        },

        reject: async (id: string, reason: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}/reject`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ reason })
            });
            if (!response.ok) throw new Error("Failed to reject request");
            return response.json();
        },

        assignDriver: async (requestId: string, driverId: string, comments?: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/recycle-requests/${requestId}/assign-driver`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ driverId, comments }),
            });
            if (!response.ok) throw new Error("Failed to assign driver");
            return response.json();
        },

        getAiPricing: async (id: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}/ai-pricing`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch AI pricing");
            return response.json();
        },

        verifyCondition: async (id: string, conditionCode: string, notes: string, finalAmount?: number): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}/verify-condition`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ verifiedConditionCode: conditionCode, notes, finalAmount })
            });
            if (!response.ok) throw new Error("Failed to verify condition");
            return response.json();
        },

        markRecycled: async (id: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}/mark-recycled`, {
                method: "POST",
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to mark recycled");
            return response.json();
        },

        markDropped: async (id: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}/mark-dropped`, {
                method: "POST",
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to mark dropped");
            return response.json();
        },

        verifyDropOff: async (id: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/intermediary/recycle-requests/${id}/verify-drop`, {
                method: "POST",
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to verify drop-off");
            return response.json();
        },

        getStatusHistory: async (id: string): Promise<any[]> => {
            const response = await fetch(`${BASE_URL}/recycle-requests/${id}/status-history`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch status history");
            return response.json();
        }
    }
};
