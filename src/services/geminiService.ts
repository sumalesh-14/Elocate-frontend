export const sendMessageToGemini = async (
    message: string,
    history: { role: string; parts: { text: string }[] }[],
    sessionId?: string,
    role?: string,
    facilityId?: string,
    userId?: string,
): Promise<{ text: string; sessionId?: string; suggestions?: string[] }> => {
    try {
        const response = await fetch('/api/proxy/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                history,
                session_id: sessionId,
                role: role,
                facility_id: facilityId,
                user_id: userId,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Chatbot Proxy Error:", data.error || data);
            
            if (data.error?.code === 'NO_API_KEY') {
                return { text: "My AI ecosystem is offline: No API keys are configured on the EcoBot server.", suggestions: [] };
            }

            return { text: "I'm having trouble connecting to the eco-network right now. Please try again in a moment.", suggestions: [] };
        }

        return { text: data.text || "", sessionId: data.session_id, suggestions: data.suggestions ?? [] };
    } catch (error: any) {
        console.error("Chatbot Fetch Error:", error);
        return { text: "I'm having trouble connecting to the eco-network right now. Please try again in a moment.", suggestions: [] };
    }
};
