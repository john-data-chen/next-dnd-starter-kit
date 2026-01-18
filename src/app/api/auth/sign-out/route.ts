import { NextResponse } from "next/server"

// POST /api/auth/sign-out
export function POST(): NextResponse {
  const response = NextResponse.json({ success: true })

  // Clear session cookie
  response.cookies.set("better-auth.session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  })

  return response
}
