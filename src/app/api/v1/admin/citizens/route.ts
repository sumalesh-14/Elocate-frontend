import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authHeader = request.headers.get("Authorization");

        const response = await fetch(`${API_BASE_URL}/api/v1/admin/citizens?${searchParams.toString()}`, {
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { Authorization: authHeader }),
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
    }
}
