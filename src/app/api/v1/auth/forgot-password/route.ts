import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // Proxying to the backend server
        const response = await fetch(`${BACKEND_URL}/api/v1/auth/forgot-password?email=${email}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Forgot Password Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
