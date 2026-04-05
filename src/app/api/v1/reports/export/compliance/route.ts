import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const formatType = searchParams.get("formatType") || "";
    const facilityId = searchParams.get("facilityId") || "";

    const url = new URL(`${BACKEND_URL}/api/v1/reports/export/compliance`);
    if (facilityId) url.searchParams.append("facilityId", facilityId);
    if (formatType) url.searchParams.append("formatType", formatType);

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
    console.error("Compliance Export Error:", error.message);
    return NextResponse.json(
      { error: "Failed to generate compliance data from proxy" },
      { status: 500 }
    );
  }
}
