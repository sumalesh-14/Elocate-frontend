/**
 * API client for the Image Device Identification Service (Python Microservice).
 *
 * ─── MOCK MODE ────────────────────────────────────────────────────────────────
 * Set USE_MOCK = true  →  cycles through all realistic scenarios locally.
 * Set USE_MOCK = false →  hits the real Python microservice.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ✅ Toggle mock mode here
const USE_MOCK = false;

export function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    // Image analyzer
    MISSING_FILE:          "Please select an image to upload.",
    INVALID_FILE_TYPE:     "Only JPEG, PNG, or WebP images are supported.",
    INVALID_FILE_SIZE:     "Image must be under 10MB.",
    INVALID_FILE_HEADERS:  "The file appears to be corrupted or misnamed.",
    MALICIOUS_FILE:        "This file failed our security check.",
    NOT_A_DEVICE:          "Please upload an image of an electronic device (phone, laptop, tablet, etc.).",

    // Material analyzer
    NOT_AN_EWASTE_DEVICE:  "Material analysis is only available for electronic devices.",
    NO_MATERIALS_FOUND:    "No recyclable materials could be identified for this device.",
    ALL_WORKERS_FAILED:    "Analysis service is temporarily unavailable. Try again later.",
    SERVICE_UNAVAILABLE:   "Analysis service is temporarily unavailable. Try again later.",
    ANALYSIS_TIMEOUT:      "Analysis timed out. Please try again.",
    
    // Server issues
    NO_LLM_WORKERS:        "Analysis service is temporarily unavailable.",
    LLM_NO_RESPONSE:       "Analysis failed to return results. Please try again.",
    INVALID_LLM_RESPONSE:  "Analysis returned an unexpected result. Please try again.",
    NO_VALID_MATERIALS:    "No valid material data could be extracted. Please try again.",
    ANALYSIS_FAILED:       "Material analysis failed unexpectedly. Please try again.",
    INTERNAL_ERROR:        "Something went wrong on our end. Please try again.",
  };

  return messages[code] ?? "Something went wrong. Please try again.";
}


const IMAGE_ANALYZER_URL =
    process.env.NEXT_PUBLIC_IMAGE_ANALYZER_URL ||
    'https://elocate-python-production.up.railway.app';
const IMAGE_ANALYZER_API_KEY =
    process.env.NEXT_PUBLIC_IMAGE_ANALYZER_API_KEY ||
    'XBZLmUDmGb0TxCGwkjPoHPAIuXPYTy0i5iOQ5HOR3Pk';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaterialAnalysisRequestPayload {
    brand_id: string;
    brand_name: string;
    category_id: string;
    category_name: string;
    model_id: string;
    model_name: string;
    country: string;
    deviceCondition?: string;
    conditionNotes?: string;
}

export interface MaterialData {
    materialName: string;
    isPrecious: boolean;
    estimatedQuantityGrams: number;
    marketRatePerGram: number;
    currency: string;
    foundIn: string;
}

export interface PlatformLink {
    platformName: string;
    link: string;
    icon: string;
    displayOrder: number;
}

export interface DevicePricing {
    currentMarketPrice: number | null;
    currency: string | null;
    platformLinks: PlatformLink[];
}

export interface RecyclingEstimate {
    totalMaterialValue: number;
    suggestedRecyclingPrice: number;
    suggestedBuybackPrice: number;
    conditionImpact: string;
    currency: string;
    priceBreakdown: string;
}

export interface MaterialAnalysisResponse {
    success: boolean;
    timestamp?: string;
    processingTimeMs: number;
    data?: {
        brand: { id: string; name: string };
        category: { id: string; name: string };
        model: { id: string; name: string };
        country: string;
        analysisDescription: string;
        materials: MaterialData[];
        devicePricing: DevicePricing;
        recyclingEstimate: RecyclingEstimate;
        metadata: {
            llmModel: string;
            analysisTimestamp: string;
        };
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

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
        accuracy: number;
        attributes: Record<string, any>;
        info_note: string | null;
        severity: 'low' | 'medium' | 'high' | 'critical';
        contains_precious_metals: boolean;
        precious_metals_info: string | null;
        contains_hazardous_materials: boolean;
        hazardous_materials_info: string | null;
        lowConfidence: boolean;
        model_uncertainty_reason: string | null;
        // Database matching fields
        category_id: string | null;
        brand_id: string | null;
        model_id: string | null;
        category_match_score: number | null;
        brand_match_score: number | null;
        model_match_score: number | null;
        database_status: 'success' | 'partial_success' | 'failure' | 'unavailable';
    } | null;
    error: {
        code: string;
        message: string;
    } | null;
}

// ─── Mock Scenarios ───────────────────────────────────────────────────────────

/**
 * Each call to analyzeDeviceImage (in mock mode) cycles to the next scenario.
 *
 * Scenarios:
 *  0 – High confidence, full DB match (Smartphone, Apple iPhone 15 Pro)
 *  1 – Medium confidence, partial DB match (Laptop, Dell XPS 15)
 *  2 – Low confidence, no DB match (Tablet, Samsung – model uncertain)
 *  3 – High confidence, hazardous + precious metals (Printer, HP LaserJet)
 *  4 – High confidence, critical severity (Battery Pack – swollen)
 *  5 – API failure / network error
 */
let _mockScenarioIndex = 0;

const MOCK_SCENARIOS: AnalysisResult[] = [
    // ── Scenario 0: Full success, high confidence ──────────────────────────
    {
        success: true,
        timestamp: new Date().toISOString(),
        processingTimeMs: 843,
        data: {
            category: 'Laptop',
            brand: 'Apple',
            model: 'MacBook Pro 16 (M4)',
            deviceType: 'Laptop Computer',
            confidenceScore: 0.94,
            accuracy: 0.92,
            attributes: { color: 'Space Black', storage: '1TB', condition_hint: 'Good' },
            info_note: 'Device appears to be in good working condition.',
            severity: 'low',
            contains_precious_metals: true,
            precious_metals_info: 'Contains gold, silver, and palladium in circuit board.',
            contains_hazardous_materials: false,
            hazardous_materials_info: null,
            lowConfidence: false,
            model_uncertainty_reason: null,
            // ⚠️ Replace these IDs with real UUIDs from your DB if you want "Use This" to pre-fill dropdowns
            category_id: 'd91afb88-740a-4232-8f6c-ce26188aaac7',
            brand_id: 'a1c320c7-9c8d-4b63-8638-1c6ee64e3b74',
            model_id: '754d5a16-6d13-4478-97aa-9072cf6d2c9b',
            category_match_score: 0.97,
            brand_match_score: 0.95,
            model_match_score: 0.91,
            database_status: 'success',
        },
        error: null,
    },

    // ── Scenario 1: Medium confidence, partial DB match ────────────────────
    {
        success: true,
        timestamp: new Date().toISOString(),
        processingTimeMs: 1124,
        data: {
            category: 'Laptop',
            brand: 'Apple',
            model: 'MacBook Pro 16 (M4)',
            deviceType: 'Laptop Computer',
            confidenceScore: 0.61,
            accuracy: 0.58,
            attributes: { screen_size: '16"', keyboard_visible: true },
            info_note: 'Could be M3 or M4 variant — angle makes it hard to distinguish.',
            severity: 'medium',
            contains_precious_metals: true,
            precious_metals_info: 'Trace gold in CPU sockets and RAM connectors.',
            contains_hazardous_materials: false,
            hazardous_materials_info: null,
            lowConfidence: false,
            model_uncertainty_reason: 'Device angle obscures the model sticker. Year variant unclear.',
            category_id: 'd91afb88-740a-4232-8f6c-ce26188aaac7',
            brand_id: 'a1c320c7-9c8d-4b63-8638-1c6ee64e3b74',
            model_id: '754d5a16-6d13-4478-97aa-9072cf6d2c9b',
            category_match_score: 0.88,
            brand_match_score: 0.79,
            model_match_score: null,
            database_status: 'partial_success',
        },
        error: null,
    },

    // ── Scenario 2: Low confidence, no DB match ────────────────────────────
    {
        success: true,
        timestamp: new Date().toISOString(),
        processingTimeMs: 672,
        data: {
            category: 'Laptop',
            brand: 'Apple',
            model: 'MacBook Pro 16 (M4)',
            deviceType: 'Laptop Computer',
            confidenceScore: 0.34,
            accuracy: 0.31,
            attributes: { screen_visible: true, trackpad_detected: false },
            info_note: 'Image quality is low. Please try a clearer, well-lit photo from the front.',
            severity: 'low',
            contains_precious_metals: false,
            precious_metals_info: null,
            contains_hazardous_materials: false,
            hazardous_materials_info: null,
            lowConfidence: true,
            model_uncertainty_reason: 'Image is blurry and lighting is poor. Cannot identify exact model series.',
            category_id: 'd91afb88-740a-4232-8f6c-ce26188aaac7',
            brand_id: 'a1c320c7-9c8d-4b63-8638-1c6ee64e3b74',
            model_id: '754d5a16-6d13-4478-97aa-9072cf6d2c9b',
            category_match_score: 0.45,
            brand_match_score: 0.38,
            model_match_score: null,
            database_status: 'failure',
        },
        error: null,
    },

    // ── Scenario 3: High confidence, hazardous + precious metals ───────────
    {
        success: true,
        timestamp: new Date().toISOString(),
        processingTimeMs: 988,
        data: {
            category: 'Laptop',
            brand: 'Apple',
            model: 'MacBook Pro 16 (M4)',
            deviceType: 'Laptop Computer',
            confidenceScore: 0.87,
            accuracy: 0.85,
            attributes: { battery_swelling: true, screen_cracked: false },
            info_note: 'Please handle with care. Battery seems damaged.',
            severity: 'high',
            contains_precious_metals: true,
            precious_metals_info: 'Small amounts of gold in circuit board connectors.',
            contains_hazardous_materials: true,
            hazardous_materials_info: 'Battery pack swelling detected.',
            lowConfidence: false,
            model_uncertainty_reason: null,
            category_id: 'd91afb88-740a-4232-8f6c-ce26188aaac7',
            brand_id: 'a1c320c7-9c8d-4b63-8638-1c6ee64e3b74',
            model_id: '754d5a16-6d13-4478-97aa-9072cf6d2c9b',
            category_match_score: 0.93,
            brand_match_score: 0.91,
            model_match_score: 0.84,
            database_status: 'success',
        },
        error: null,
    },

    // ── Scenario 4: Critical severity (swollen battery) ───────────────────
    {
        success: true,
        timestamp: new Date().toISOString(),
        processingTimeMs: 756,
        data: {
            category: 'Laptop',
            brand: 'Apple',
            model: 'MacBook Pro 16 (M4)',
            deviceType: 'Laptop Computer',
            confidenceScore: 0.82,
            accuracy: 0.79,
            attributes: { case_bulging: true, screen_cracked: true },
            info_note: 'Bottom cover appears to be bulging — possible battery swelling. Handle with extreme care. Do NOT attempt to puncture or charge.',
            severity: 'critical',
            contains_precious_metals: true,
            precious_metals_info: 'Gold and palladium in board connectors.',
            contains_hazardous_materials: true,
            hazardous_materials_info: 'Swollen Li-ion battery: risk of fire or explosion if punctured or exposed to heat.',
            lowConfidence: false,
            model_uncertainty_reason: null,
            category_id: 'd91afb88-740a-4232-8f6c-ce26188aaac7',
            brand_id: 'a1c320c7-9c8d-4b63-8638-1c6ee64e3b74',
            model_id: '754d5a16-6d13-4478-97aa-9072cf6d2c9b',
            category_match_score: 0.89,
            brand_match_score: 0.83,
            model_match_score: 0.76,
            database_status: 'success',
        },
        error: null,
    },

    // ── Scenario 5: API / Network failure ─────────────────────────────────
    {
        success: false,
        timestamp: new Date().toISOString(),
        processingTimeMs: 0,
        data: null,
        error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Mock: AI analysis service is temporarily unavailable. Please try again later.',
        },
    },
];

// ─── Mock Helper ──────────────────────────────────────────────────────────────

async function mockAnalyzeDeviceImage(_file: File): Promise<AnalysisResult> {
    // Simulate realistic network delay (800ms – 1.8s)
    const delay = 800 + Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const scenario = MOCK_SCENARIOS[_mockScenarioIndex % MOCK_SCENARIOS.length];
    _mockScenarioIndex++;

    console.info(
        `[MOCK AI] Scenario ${(_mockScenarioIndex - 1) % MOCK_SCENARIOS.length}: ` +
        `${scenario.success ? `${scenario.data?.brand} ${scenario.data?.model} (${Math.round((scenario.data?.confidenceScore ?? 0) * 100)}% conf)` : `ERROR – ${scenario.error?.code}`}`
    );

    // Return a fresh copy with updated timestamp
    return {
        ...scenario,
        timestamp: new Date().toISOString(),
        processingTimeMs: Math.round(delay),
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyzes a device image.
 * Delegates to mock or real implementation based on USE_MOCK flag.
 */
export async function analyzeDeviceImage(file: File): Promise<AnalysisResult> {
    if (USE_MOCK) {
        return mockAnalyzeDeviceImage(file);
    }

    // ── Real implementation ────────────────────────────────────────────────
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${IMAGE_ANALYZER_URL}/api/v1/analyze`, {
            method: 'POST',
            headers: { 'X-API-Key': IMAGE_ANALYZER_API_KEY },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error?.message || `Analysis failed with status ${response.status}`
            );
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
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to connect to image analysis service',
            },
        };
    }
}

/**
 * Analyzes materials for a device based on model details.
 */
export async function analyzeDeviceMaterials(payload: MaterialAnalysisRequestPayload): Promise<MaterialAnalysisResponse> {
    if (USE_MOCK) {
        // Mock implementation for material analysis
        return new Promise((resolve) => setTimeout(() => resolve({
            success: true,
            timestamp: new Date().toISOString(),
            processingTimeMs: 1954,
            data: {
                brand: { id: payload.brand_id, name: payload.brand_name },
                category: { id: payload.category_id, name: payload.category_name },
                model: { id: payload.model_id, name: payload.model_name },
                country: payload.country,
                analysisDescription: "The analysis methodology includes estimating the quantities of various materials present in a " + payload.model_name + " based on typical device composition and e-waste recycling market data. Recovery efficiency considerations are also taken into account, assuming an average recovery efficiency of 70%. Market rates are based on realistic e-waste scrap rates for India, adjusted for recovery costs and efficiency.",
                materials: [
                    { materialName: "Gold", isPrecious: true, estimatedQuantityGrams: 0.034, marketRatePerGram: 4500.0, currency: "INR", foundIn: "Circuit board and connectors" },
                    { materialName: "Silver", isPrecious: true, estimatedQuantityGrams: 1.2, marketRatePerGram: 55.0, currency: "INR", foundIn: "Circuit board, keyboard, and display connectors" },
                    { materialName: "Copper", isPrecious: false, estimatedQuantityGrams: 450.0, marketRatePerGram: 0.45, currency: "INR", foundIn: "Circuit board, wiring, and heat sinks" },
                    { materialName: "Aluminum", isPrecious: false, estimatedQuantityGrams: 1200.0, marketRatePerGram: 0.165, currency: "INR", foundIn: "Body, frame, and heat sinks" },
                    { materialName: "Lithium", isPrecious: false, estimatedQuantityGrams: 60.0, marketRatePerGram: 100.0, currency: "INR", foundIn: "Lithium-ion battery" },
                    { materialName: "Cobalt", isPrecious: false, estimatedQuantityGrams: 30.0, marketRatePerGram: 350.0, currency: "INR", foundIn: "Lithium-ion battery" }
                ],
                devicePricing: {
                    currentMarketPrice: null,
                    currency: "INR",
                    platformLinks: [
                        { platformName: "Flipkart", link: "https://www.flipkart.com", icon: "https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png", displayOrder: 1 },
                        { platformName: "Amazon", link: "https://www.amazon.in", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", displayOrder: 2 },
                        { platformName: "Apple Official", link: "https://www.apple.com/in/", icon: "https://www.apple.com/favicon.ico", displayOrder: 999 }
                    ]
                },
                recyclingEstimate: {
                    totalMaterialValue: 19797.00,
                    suggestedRecyclingPrice: 10888.35,
                    suggestedBuybackPrice: 137494.50,
                    conditionImpact: "Device condition '" + payload.deviceCondition + "' results in 55% of material value. Minor cosmetic wear does not significantly impact material extraction efficiency.",
                    currency: "INR",
                    priceBreakdown: "Material value: 19797.00 | Recycling price: 10888.35 | Buyback price: 137494.50 | Recommendation: Buyback is better than recycling."
                },
                metadata: {
                    llmModel: "llama-3.3-70b-versatile",
                    analysisTimestamp: new Date().toISOString()
                }
            }
        } as MaterialAnalysisResponse), 800));
    }

    try {
        const response = await fetch(`/api/proxy/analyze-materials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Material analysis failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Material analysis error:', error);
        return {
            success: false,
            processingTimeMs: 0,
            error: {
                code: 'NETWORK_ERROR',
                message: error instanceof Error ? error.message : 'Failed to connect to material analysis service',
            },
        };
    }
}

/**
 * Checks if the image analysis service is healthy.
 */
export async function checkAnalyzerHealth(): Promise<boolean> {
    if (USE_MOCK) return true;

    try {
        const response = await fetch(`${IMAGE_ANALYZER_URL}/health`);
        const data = await response.json();
        return response.ok && (data.status === 'healthy' || data.status === 'degraded');
    } catch {
        return false;
    }
}
