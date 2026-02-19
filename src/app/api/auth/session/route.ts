import * as jose from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { getUserByEmail } from "@/lib/db/user"

// JWT secret - must match sign-in route
const AUTH_SECRET = process.env.AUTH_SECRET
if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required")
}
const JWT_SECRET = new TextEncoder().encode(AUTH_SECRET)

interface JWTPayload {
  id: string
  email: string
  name: string
}

async function verifySession(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// GET /api/auth/session
export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get("better-auth.session_token")?.value

  if (!token) {
    return NextResponse.json({ user: null })
  }

  const payload = await verifySession(token)
  if (!payload) {
    return NextResponse.json({ user: null })
  }

  // Fetch fresh user from DB to ensure we have the correct ID (in case DB was reset)
  const dbUser = await getUserByEmail(payload.email)
  if (!dbUser) {
    // User in token no longer exists in DB
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name
    }
  })
}
