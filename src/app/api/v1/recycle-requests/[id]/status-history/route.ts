import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get("Authorization");
        const { id } = await params;

        const response = await fetch(`${API_BASE_URL}/api/v1/recycle-requests/${id}/status-history`, {
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
        console.error("Get Status History Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
