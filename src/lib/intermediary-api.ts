import { getToken } from "@/app/intermediary/sign-in/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

console.log("Intermediary Driver Module - Target Backend URL:", BASE_URL);

const getHeaders = (contentType: string = "application/json") => {
    const headers: Record<string, string> = {};
    if (contentType) headers["Content-Type"] = contentType;

    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
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
}

export interface DriverRequest {
    name: string;
    email: string;
    phone: string;
    vehicleNumber: string;
    availability?: string;
    vehicleType?: string;
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
        getAll: async (search?: string, availability?: string, page: number = 0, size: number = 8): Promise<PageResponse<Driver>> => {
            let url = `${BASE_URL}/api/v1/drivers?page=${page}&size=${size}&`;
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
            const response = await fetch(`${BASE_URL}/api/v1/drivers`, {
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
            const response = await fetch(`${BASE_URL}/api/v1/drivers/${id}`, {
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
            const url = `${BASE_URL}/api/v1/drivers/${id}`;
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
        approve: async (id: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/api/v1/recycle-requests/${id}/approve`, {
                method: "PUT",
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to approve request");
            return response.json();
        },

        assignDriver: async (requestId: string, driverId: string): Promise<any> => {
            const response = await fetch(`${BASE_URL}/api/v1/recycle-requests/${requestId}/assign-driver`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ assignedDriverId: driverId }),
            });
            if (!response.ok) throw new Error("Failed to assign driver");
            return response.json();
        },
    }
};
