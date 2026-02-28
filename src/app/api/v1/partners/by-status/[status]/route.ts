import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ status: string }> }
) {
  try {
    const { status } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '10';

    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization');

    console.log('=== LIST PARTNERS BY STATUS ===');
    console.log('Status:', status);
    console.log('Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log('Backend URL:', `${BACKEND_URL}/api/v1/partners/by-status/${status}`);
    console.log('==============================');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/partners/by-status/${status}?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Backend error:', error);
      return NextResponse.json(
        { error: error || 'Failed to fetch partners' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Partners found:', data.content?.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching partners by status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
