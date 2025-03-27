import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  if (!req.auth) {
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = req.url.replace(req.nextUrl.pathname, ROUTES.AUTH.LOGIN);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ['/api/:path*', '/boards/:path*', '/((?!login).*)']
};
