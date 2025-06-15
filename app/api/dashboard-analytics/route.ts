import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined in environment variables");
    }

    const response = await fetch(`${backendUrl}/dashboard-analytics`);

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch dashboard analytics'
      },
      { status: 500 }
    );
  }
}
