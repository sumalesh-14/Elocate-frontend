import { NextRequest, NextResponse } from 'next/server';

const PYTHON_URL = process.env.IMAGE_ANALYZER_URL || process.env.NEXT_PUBLIC_IMAGE_ANALYZER_URL || 'https://web-production-ca2d4.up.railway.app';
const API_KEY = process.env.IMAGE_ANALYZER_API_KEY || process.env.NEXT_PUBLIC_IMAGE_ANALYZER_API_KEY || 'XBZLmUDmGb0TxCGwkjPoHPAIuXPYTy0i5iOQ5HOR3Pk';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${PYTHON_URL}/api/v1/analyze-materials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[proxy/analyze-materials] error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'PROXY_ERROR', message: 'Failed to reach analysis service' } },
            { status: 502 }
        );
    }
}
