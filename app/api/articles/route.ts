import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Proxy to backend Flask API
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const url = new URL(req.url);
  const params = url.search ? url.search : '';
  const res = await fetch(`${backendUrl}/articles${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

