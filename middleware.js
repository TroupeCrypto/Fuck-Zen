import { NextResponse } from "next/server";

export const config = {
  matcher: [
    "/war-room/:path*",
    "/api/private/:path*",
    "/org/:path*",
    "/api/org/:path*",
    "/api/reviews/:path*",
    "/api/audit/:path*"
  ]
};

/**
 * Middleware for authentication and AI binding enforcement
 * Per PEER_REVIEW_FRAMEWORK_V2
 */
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Public org routes (org-map, org pages for viewing) - no auth required
  if (pathname.startsWith('/org')) {
    // Add AI binding headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-troupe-framework', 'PEER_REVIEW_FRAMEWORK_V2');
    return response;
  }
  
  // Protected API routes require bearer token
  if (pathname.startsWith('/api/private') || pathname.startsWith('/war-room')) {
    const auth = req.headers.get("authorization") || "";
    const hasBearer = /^Bearer\s+.+$/i.test(auth);

    if (!hasBearer) {
      return NextResponse.json({ ok: false, error: "Missing bearer token" }, { status: 401 });
    }
  }
  
  // API routes for org, reviews, audit - allow with AI identification header
  if (pathname.startsWith('/api/org') || pathname.startsWith('/api/reviews') || pathname.startsWith('/api/audit')) {
    const response = NextResponse.next();
    
    // Extract AI identification if present
    const aiId = req.headers.get('x-ai-id');
    const aiName = req.headers.get('x-ai-name');
    
    // Log AI actions for audit trail
    if (aiId) {
      response.headers.set('x-ai-actor', aiId);
      response.headers.set('x-ai-actor-name', aiName || 'UNKNOWN');
    }
    
    response.headers.set('x-troupe-framework', 'PEER_REVIEW_FRAMEWORK_V2');
    return response;
  }

  return NextResponse.next();
}
