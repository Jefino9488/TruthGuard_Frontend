import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const res = await fetch(`${backendUrl}/dashboard-analytics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

