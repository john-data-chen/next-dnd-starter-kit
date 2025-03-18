import { ROUTES } from '@/constants/routes';
import authConfig from '@/lib/auth/auth.config';
import NextAuth from 'next-auth';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const url = req.url.replace(req.nextUrl.pathname, ROUTES.AUTH.LOGIN);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ['/boards/:path*', '/((?!login).*)']
};
