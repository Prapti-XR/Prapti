/**
 * API Proxy for R2 Assets
 * Proxies requests to R2 to avoid CORS issues
 * 
 * Usage: /api/proxy-asset?url=<encoded-r2-url>
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetUrl = searchParams.get('url');

    if (!assetUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validate that the URL is from your R2 bucket
    const r2PublicUrl = process.env.R2_PUBLIC_URL || '';
    if (!assetUrl.startsWith(r2PublicUrl)) {
      return NextResponse.json(
        { error: 'Invalid asset URL' },
        { status: 403 }
      );
    }

    // Fetch the asset from R2
    const response = await fetch(assetUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch asset from R2' },
        { status: response.status }
      );
    }

    // Get the asset data
    const data = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Return the asset with proper CORS headers
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Asset proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
