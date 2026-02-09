import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // Get authorization token from request headers
        const authHeader = request.headers.get("Authorization");

        // Proxying to the backend server
        const response = await fetch(`https://elocate-api-production-2b4c.up.railway.app/elocate/api/v1/device-brands`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Delete Device Brand Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
