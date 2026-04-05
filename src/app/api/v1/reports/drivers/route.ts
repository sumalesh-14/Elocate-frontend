import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get("facilityId") || "";

    const url = new URL(`${BACKEND_URL}/api/v1/reports/drivers`);
    if (facilityId) url.searchParams.append("facilityId", facilityId);

    const authHeader = req.headers.get("Authorization");

    const backendRes = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {})
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
        return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Drivers Report Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch drivers stats from proxy" },
      { status: 500 }
    );
  }
}
