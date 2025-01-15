import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { ROUTES } from '@/constants/routes';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const url = req.url.replace(req.nextUrl.pathname, ROUTES.HOME);
    return Response.redirect(url);
  }
});

export const config = { matcher: [ROUTES.PATH_MATCHER] };
