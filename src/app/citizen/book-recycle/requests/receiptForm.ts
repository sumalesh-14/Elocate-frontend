import type { Request } from "./types";

/**
 * Generates a formatted receipt content for a recycle request
 * @param request - The request object containing all details
 * @returns Formatted receipt string
 */
export const generateReceiptContent = (request: Request): string => {
    return `
═══════════════════════════════════════════════════════
                    E-CYCLE RECEIPT
═══════════════════════════════════════════════════════

Request ID: ${request.id}
Date: ${new Date().toLocaleDateString()}

───────────────────────────────────────────────────────
DEVICE INFORMATION
───────────────────────────────────────────────────────
Device: ${request.deviceBrand} ${request.deviceModel}
Type: ${request.deviceType}
Condition: ${request.deviceCondition}
Quantity: ${request.quantity}
${request.estimatedValue ? `Estimated Value: ${request.estimatedValue}` : ''}

───────────────────────────────────────────────────────
PICKUP DETAILS
───────────────────────────────────────────────────────
Date: ${request.pickupDate}
Time Slot: ${request.pickupTime}
Address: ${request.address}
City: ${request.city}, ${request.zipCode}
Phone: ${request.phoneNumber}

───────────────────────────────────────────────────────
STATUS
───────────────────────────────────────────────────────
Status: ${request.status.toUpperCase()}
Request Date: ${request.requestDate}

═══════════════════════════════════════════════════════
Thank you for choosing E-Cycle!
Together we're making a greener future.
═══════════════════════════════════════════════════════
    `.trim();
};

/**
 * Downloads a receipt file for a recycle request
 * @param request - The request object containing all details
 */
export const downloadReceipt = (request: Request): void => {
    // Generate receipt content
    const receiptContent = generateReceiptContent(request);

    // Create a Blob from the content
    const blob = new Blob([receiptContent], { type: 'text/plain' });

    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `E-Cycle_Receipt_${request.id}_${new Date().toISOString().split('T')[0]}.txt`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
