import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 });
  }

  const authHeader = request.headers.get('Authorization');
  const headers: HeadersInit = {};
  if (authHeader) headers['Authorization'] = authHeader;

  const res = await fetch(
    `${BACKEND_URL}/api/v1/partner-auth/document-url?url=${encodeURIComponent(url)}`,
    { headers }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
