/**
 * API client for the Image Device Identification Service (Python Microservice).
 */

const IMAGE_ANALYZER_URL = process.env.NEXT_PUBLIC_IMAGE_ANALYZER_URL || 'https://elocate-python-production.up.railway.app';
const IMAGE_ANALYZER_API_KEY = process.env.NEXT_PUBLIC_IMAGE_ANALYZER_API_KEY || 'XBZLmUDmGb0TxCGwkjPoHPAIuXPYTy0i5iOQ5HOR3Pk';

export interface AnalysisResult {
    success: boolean;
    timestamp: string;
    processingTimeMs: number;
    data: {
        category: string;
        brand: string | null;
        model: string | null;
        deviceType: string;
        confidenceScore: number;
        attributes: Record<string, any>;
        info_note: string | null;
        severity: 'low' | 'medium' | 'high' | 'critical';
        contains_precious_metals: boolean;
        precious_metals_info: string | null;
        contains_hazardous_materials: boolean;
        hazardous_materials_info: string | null;
        lowConfidence: boolean;
    } | null;
    error: {
        code: string;
        message: string;
    } | null;
}

/**
 * Analyzes a device image using the Python microservice.
 */
export async function analyzeDeviceImage(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${IMAGE_ANALYZER_URL}/api/v1/analyze`, {
            method: 'POST',
            headers: {
                'X-API-Key': IMAGE_ANALYZER_API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Analysis failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Image analysis error:', error);
        return {
            success: false,
            timestamp: new Date().toISOString(),
            processingTimeMs: 0,
            data: null,
            error: {
                code: 'NETWORK_ERROR',
                message: error instanceof Error ? error.message : 'Failed to connect to image analysis service',
            },
        };
    }
}

/**
 * Checks if the image analysis service is healthy.
 */
export async function checkAnalyzerHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${IMAGE_ANALYZER_URL}/health`);
        const data = await response.json();
        return response.ok && (data.status === 'healthy' || data.status === 'degraded');
    } catch (error) {
        return false;
    }
}
