import { ROUTES } from '@/constants/routes';
import { getUserFromDb } from '@/lib/db/user';
import { SignInValidation } from '@/types/authUserForm';
import { NextAuthConfig } from 'next-auth';
import Credential from 'next-auth/providers/credentials';

const authConfig = {
  providers: [
    Credential({
      async authorize(credentials) {
        const validatedFields = SignInValidation.safeParse(credentials);
        if (validatedFields.success) {
          const { email } = validatedFields.data;
          const user = await getUserFromDb(email);
          if (!user) return null;
          return user;
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: ROUTES.AUTH.LOGIN
  }
} satisfies NextAuthConfig;

export default authConfig;
