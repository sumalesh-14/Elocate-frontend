import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/feedback?userId=${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
            },
            body: JSON.stringify(body),
        });

        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Create Feedback Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
