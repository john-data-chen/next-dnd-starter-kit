import { ROUTES } from '@/constants/routes'
import { getUserByEmail } from '@/lib/db/user'
import { SignInValidation } from '@/types/authUserForm'
import NextAuth, { NextAuthConfig } from 'next-auth'
import Credential from 'next-auth/providers/credentials'

const authConfig = {
  providers: [
    Credential({
      async authorize(credentials) {
        try {
          const validatedFields = await SignInValidation.safeParseAsync(credentials)
          if (validatedFields.success) {
            const { email } = validatedFields.data
            const user = await getUserByEmail(email)
            return user || null
          }
          return null
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: ROUTES.AUTH.LOGIN
  }
} satisfies NextAuthConfig

export const { auth, handlers, signOut, signIn } = NextAuth(authConfig)
