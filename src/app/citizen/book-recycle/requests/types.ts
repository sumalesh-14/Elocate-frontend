// TypeScript Interfaces for Recycle Requests
export interface Request {
    id: string;
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    deviceCondition: string;
    quantity: number;
    status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
    pickupDate: string;
    pickupTime: string;
    address: string;
    city: string;
    zipCode: string;
    phoneNumber: string;
    requestDate: string;
    estimatedValue?: string;
}
