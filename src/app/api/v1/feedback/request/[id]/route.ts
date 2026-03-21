import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const awaitedParams = await params;
        const id = awaitedParams?.id || request.url.split('/').pop()?.split('?')[0];
        const authHeader = request.headers.get("Authorization");

        if (!id) {
            console.error("Missing ID inside route.ts! awaitedParams:", awaitedParams, "URL:", request.url);
            return NextResponse.json({ error: "Missing request id explicitly" }, { status: 400 });
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/feedback/request/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader && { "Authorization": authHeader }),
            },
        });

        if (response.status === 404) {
            return new NextResponse(null, { status: 404 });
        }
        
        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Get Feedback Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
