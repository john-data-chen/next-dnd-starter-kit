import * as jose from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// JWT secret - must match sign-in route
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "demo-secret-key-change-in-production"
)

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

  return NextResponse.json({
    user: {
      id: payload.id,
      email: payload.email,
      name: payload.name
    }
  })
}
