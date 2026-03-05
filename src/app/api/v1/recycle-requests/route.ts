import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const status = searchParams.get("status");
        const searchTerm = searchParams.get("searchTerm");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
        }

        const params = new URLSearchParams({ userId });
        if (status) params.append("status", status);
        if (searchTerm) params.append("searchTerm", searchTerm);

        const response = await fetch(`${API_BASE_URL}/api/v1/recycle-requests?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Get Recycle Requests Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/recycle-requests?userId=${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Create Recycle Request Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
