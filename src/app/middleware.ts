import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');

  if (isAuthenticated && isAuthRoute) {
    return Response.redirect(new URL(ROUTES.BOARDS.ROOT, req.url));
  }

  if (!isAuthenticated) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.redirect(new URL(ROUTES.AUTH.LOGIN, req.url));
  }
});

export const config = {
  matcher: [
    '/api/:path*',
    '/boards/:path*',
    '/((?!login|_next/static|_next/image|favicon.ico).*)'
  ]
};
