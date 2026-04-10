import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');

  // We rewrite if the host starts with "admin."
  // This covers admin.domain.com and admin.localhost:3000
  if (hostname && hostname.startsWith('admin.')) {
    // If they ask for /, rewrite to /admin
    // If they ask for /products, rewrite to /admin/products
    url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Also block direct visits to /admin on the main domain for security obscurity
  if (url.pathname.startsWith('/admin') && (!hostname || !hostname.startsWith('admin.'))) {
     return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
