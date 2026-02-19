// Auth configuration and server-side session getter for passwordless demo mode
import * as jose from "jose"
import { cookies } from "next/headers"

import { ROUTES } from "@/constants/routes"

// JWT secret - must match sign-in route
const AUTH_SECRET = process.env.AUTH_SECRET
if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required")
}
const JWT_SECRET = new TextEncoder().encode(AUTH_SECRET)

interface User {
  id: string
  email: string
  name: string
  image?: string
}

interface Session {
  user: User
}

export const authConfig = {
  pages: {
    signIn: ROUTES.AUTH.LOGIN
  },
  session: {
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}

/**
 * Server-side function to get current session from JWT cookie
 * Replaces next-auth's auth() function
 */
export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("better-auth.session_token")?.value

    if (!token) {
      return null
    }

    const { payload } = await jose.jwtVerify(token, JWT_SECRET)

    if (!payload.id || !payload.email || !payload.name) {
      return null
    }

    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string
      }
    }
  } catch {
    return null
  }
}
