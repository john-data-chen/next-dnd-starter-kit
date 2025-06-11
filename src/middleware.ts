import { ROUTES } from '@/constants/routes';
import { routing } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

// Assuming you'll export these

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  // First, let the i18n middleware handle the request
  // It will rewrite the URL if necessary and add locale information
  const i18nResponse = intlMiddleware(req);
  if (i18nResponse) return i18nResponse; // If i18n middleware returns a response, use it

  const isAuthenticated = !!req.auth;
  const { nextUrl } = req;
  const { pathname, locale } = nextUrl;

  const isApiRoute = pathname.startsWith('/api');
  // After `next-intl` rewrites the path, we check the non-localized path.
  const isAuthRoute = pathname === ROUTES.AUTH.LOGIN;

  // Construct redirect URLs with the locale determined by `next-intl`
  const getRedirectUrl = (path: string) => {
    return new URL(`/${locale}${path}`, req.url);
  };

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(getRedirectUrl(ROUTES.BOARDS.ROOT));
  }

  if (!isAuthenticated) {
    if (isApiRoute) {
      // For API routes, we might not want to redirect to a localized login page
      // or ensure the API doesn't get locale prefixed if not intended.
      // The current matcher might need adjustment if API routes shouldn't be localized.
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // For non-API routes, redirect to the localized login page
    if (!isAuthRoute) {
      return NextResponse.redirect(getRedirectUrl(ROUTES.AUTH.LOGIN));
    }
  }
  // If authenticated and not an auth route, or no specific action needed, proceed
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
