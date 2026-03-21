import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const response = await fetch(`${BACKEND_URL}/api/v1/partner-auth/upload-document`, {
            method: 'POST',
            body: formData,
            // Do NOT set Content-Type — fetch sets it automatically with the correct multipart boundary
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Upload proxy failed: ' + (error?.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
