import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Proxying to the backend server
        const response = await fetch("https://elocate-api-production-2b4c.up.railway.app/elocate/api/v1/auth/register", {
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
