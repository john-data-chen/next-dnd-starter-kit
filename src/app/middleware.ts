import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';

export default auth((req) => {
  if (!req.auth) {
    const url = req.url.replace(req.nextUrl.pathname, ROUTES.AUTH.LOGIN);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ['/boards/:path*', '/((?!login).*)']
};
