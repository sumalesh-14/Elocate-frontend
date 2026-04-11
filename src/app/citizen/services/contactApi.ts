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

export const submitContactForm = async (formData: ContactFormData): Promise<ApiResponse> => {
    try {
        const response = await fetch('/api/v1/contact-issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to send message. Please try again.',
            };
        }

        return {
            success: true,
            message: "Thank you for contacting us! We'll get back to you within 24 hours.",
            data,
        };
    } catch {
        return {
            success: false,
            message: 'Network error. Please check your connection.',
        };
    }
};
