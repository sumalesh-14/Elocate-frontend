export const sendMessageToGemini = async (
    message: string,
    history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
    try {
        const response = await fetch('/api/proxy/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                history,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Chatbot Proxy Error:", data.error || data);
            
            // Check if it's the specific missing API key error from our backend
            if (data.error?.code === 'NO_API_KEY') {
                return "My AI ecosystem is offline: No API keys are configured on the EcoBot server.";
            }

            return "I'm having trouble connecting to the eco-network right now. Please try again in a moment.";
        }

        return data.text || "";
    } catch (error: any) {
        console.error("Chatbot Fetch Error:", error);
        return "I'm having trouble connecting to the eco-network right now. Please try again in a moment.";
    }
};
