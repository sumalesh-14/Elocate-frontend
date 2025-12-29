// Dummy API service for contact form
// TODO: Replace with actual API endpoints later

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Sends contact form data to the server
 * @param formData - The contact form data
 * @returns Promise with the API response
 */
export const submitContactForm = async (
    formData: ContactFormData
): Promise<ApiResponse> => {
    // TODO: Replace this with actual API endpoint
    // Example: const response = await fetch('/api/contact', { ... })

    // Simulating API call with delay
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulating successful response
            resolve({
                success: true,
                message: "Thank you for contacting us! We'll get back to you within 24 hours.",
                data: {
                    id: Math.random().toString(36).substring(7),
                    timestamp: new Date().toISOString(),
                },
            });

            // Uncomment below to simulate error
            // resolve({
            //   success: false,
            //   message: "Failed to send message. Please try again.",
            // });
        }, 1500); // 1.5 second delay to simulate network request
    });
};

/**
 * Example of how to implement actual API call:
 * 
 * export const submitContactForm = async (
 *   formData: ContactFormData
 * ): Promise<ApiResponse> => {
 *   try {
 *     const response = await fetch('/api/contact', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *       body: JSON.stringify(formData),
 *     });
 * 
 *     const data = await response.json();
 * 
 *     if (!response.ok) {
 *       return {
 *         success: false,
 *         message: data.message || 'Failed to send message',
 *       };
 *     }
 * 
 *     return {
 *       success: true,
 *       message: data.message || 'Message sent successfully!',
 *       data: data,
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       message: 'Network error. Please check your connection.',
 *     };
 *   }
 * };
 */
