import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('=== USER REGISTRATION API ROUTE ===');
        console.log('Request body:', JSON.stringify(body, null, 2));
        console.log('Backend URL:', `${BACKEND_URL}/api/v1/auth/register`);
        console.log('==================================');

        // Proxying to the backend server
        const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Register Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
