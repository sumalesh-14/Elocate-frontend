// TypeScript Interfaces for Recycle Requests

/** Raw API response shape from the elocate backend */
export interface RecycleRequestApiResponse {
    id: string;
    requestNumber: string | null;  // Human-readable request ID (e.g., RCY-2024-000001)
    deviceModelId: string;
    deviceModelName: string;
    brandName: string;
    categoryName: string;
    conditionCode: string;
    estimatedAmount: number | null;
    finalAmount: number | null;
    status: string;
    fulfillmentType: string;
    fulfillmentStatus: string;
    fulfillmentStatusDisplay: string;
    pickupAddressId: string | null;
    facilityId: string | null;
    facilityName: string | null;
    // Pickup address details (populated when fulfillmentType = PICKUP)
    pickupAddress: string | null;
    pickupCity: string | null;
    pickupState: string | null;
    pickupPincode: string | null;
    // Scheduled pickup date (ISO date string, e.g. "2026-03-10")
    pickupDate: string | null;
    certificateUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

/** UI-facing request model used throughout the components */
export interface Request {
    id: string;
    requestNumber: string;  // Human-readable request ID (e.g., RCY-2024-000001)
    /** Icon-selection key derived from categoryName (e.g. "laptop", "smartphone") */
    deviceType: string;
    /** Raw category name from the backend (e.g. "Laptop & Notebooks", "Mobile Phones") */
    categoryName: string;
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
    // Raw API fields kept for display/actions
    fulfillmentStatus?: string;
    fulfillmentStatusDisplay?: string;
    fulfillmentType?: string;
    estimatedAmount?: number | null;
    finalAmount?: number | null;
    certificateUrl?: string | null;
}

/**
 * Maps an API response to the UI Request model.
 * Fields that don't exist in the API response are given sensible defaults.
 */
export function mapApiResponseToRequest(r: RecycleRequestApiResponse): Request {
    return {
        id: r.id,
        requestNumber: r.requestNumber || r.id.slice(-8),  // Fallback to last 8 chars of UUID if no requestNumber
        categoryName: r.categoryName || "Unknown Category",
        deviceType: mapCategoryToType(r.categoryName),
        deviceBrand: r.brandName || "Unknown",
        deviceModel: r.deviceModelName || "Unknown",
        deviceCondition: r.conditionCode || "unknown",
        quantity: 1,
        status: mapApiStatus(r.fulfillmentStatus, r.status),
        pickupDate: r.pickupDate || "",
        pickupTime: "",
        address: r.pickupAddress ?? "",
        city: r.pickupCity ?? "",
        zipCode: r.pickupPincode ?? "",
        phoneNumber: "",
        requestDate: r.createdAt ? r.createdAt.split("T")[0] : "",
        estimatedValue: r.estimatedAmount != null ? `₹${r.estimatedAmount}` : undefined,
        fulfillmentStatus: r.fulfillmentStatus,
        fulfillmentStatusDisplay: r.fulfillmentStatusDisplay,
        fulfillmentType: r.fulfillmentType,
        estimatedAmount: r.estimatedAmount,
        finalAmount: r.finalAmount,
        certificateUrl: r.certificateUrl,
    };
}

/** Map category name to a device-type key used for icon lookup */
function mapCategoryToType(category: string): string {
    if (!category) return "other";
    const c = category.toLowerCase();
    if (c.includes("laptop") || c.includes("computer")) return "laptop";
    if (c.includes("phone") || c.includes("mobile") || c.includes("smartphone")) return "smartphone";
    if (c.includes("tablet")) return "tablet";
    if (c.includes("printer")) return "printer";
    if (c.includes("tv") || c.includes("television")) return "tv";
    if (c.includes("headphone") || c.includes("earphone") || c.includes("audio")) return "headphones";
    if (c.includes("watch")) return "smartwatch";
    if (c.includes("keyboard") || c.includes("mouse") || c.includes("peripheral")) return "keyboard";
    return "other";
}

/**
 * Map backend fulfillment/recycle statuses to UI statuses.
 * The backend has two parallel status systems:
 *   - FulfillmentStatus (logistics): PICKUP_REQUESTED → PICKUP_COMPLETED / DROP_PENDING → DROP_VERIFIED
 *   - RecycleStatus (business): CREATED | VERIFIED | RECYCLED | REJECTED
 */
function mapApiStatus(
    fulfillmentStatus: string,
    recycleStatus: string
): Request["status"] {
    const fs = (fulfillmentStatus || "").toUpperCase();
    const rs = (recycleStatus || "").toUpperCase();

    // Business outcome takes priority
    if (rs === "REJECTED") return "cancelled";
    if (rs === "RECYCLED") return "completed";
    if (rs === "VERIFIED") return "confirmed";

    // Logistics-based mapping
    if (fs === "PICKUP_REQUESTED" || fs === "DROP_PENDING") return "pending";
    if (fs === "PICKUP_ASSIGNED" || fs === "PICKUP_SCHEDULED") return "confirmed";
    if (fs === "PICKUP_IN_PROGRESS") return "in-progress";
    if (fs === "PICKUP_COMPLETED" || fs === "DROPPED_AT_FACILITY" || fs === "DROP_VERIFIED") return "completed";
    if (fs === "PICKUP_FAILED") return "cancelled";

    // Fallback to CREATED status
    if (rs === "CREATED") return "pending";
    return "pending";
}
