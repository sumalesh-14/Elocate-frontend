import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const facilityId = searchParams.get("facilityId") || "";

    const url = new URL(`${BACKEND_URL}/api/v1/reports/overview`);
    if (facilityId) url.searchParams.append("facilityId", facilityId);
    if (startDate) url.searchParams.append("startDate", startDate);
    if (endDate) url.searchParams.append("endDate", endDate);

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
    console.error("Overview Report Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch report overview from proxy" },
      { status: 500 }
    );
  }
}
