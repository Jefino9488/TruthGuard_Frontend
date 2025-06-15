import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sortBy = searchParams.get('sort_by') || 'date';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const response = await fetch(
      `${backendUrl}/articles?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`
    );

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch articles'
      },
      { status: 500 }
    );
  }
}
