import * as jose from "jose"
import { NextRequest, NextResponse } from "next/server"

import { getUserByEmail } from "@/lib/db/user"

// JWT secret - in production use environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "demo-secret-key-change-in-production"
)

export async function createSession(user: { id: string; email: string; name: string }) {
  const token = await new jose.SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
  return token
}

// POST /api/auth/sign-in
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // getUserByEmail returns { id, email, name } - use id directly
    const token = await createSession({
      id: user.id,
      email: user.email,
      name: user.name
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    })

    // Set session cookie
    response.cookies.set("better-auth.session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    })

    return response
  } catch (error) {
    console.error("Sign-in error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
