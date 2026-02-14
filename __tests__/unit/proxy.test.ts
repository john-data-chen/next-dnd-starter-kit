import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"
import { describe, expect, it, vi } from "vitest"

import middleware from "@/proxy"

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: vi.fn()
}))

vi.mock("next-intl/middleware", () => ({
  default: vi.fn(() => (req: any) => NextResponse.next())
}))

describe("Middleware (proxy.ts)", () => {
  const createMockRequest = (pathname: string) => {
    return {
      nextUrl: { pathname },
      url: `http://localhost:3000${pathname}`
    } as unknown as NextRequest
  }

  it("should allow /api/auth routes to pass through", () => {
    const req = createMockRequest("/api/auth/session")
    const res = middleware(req)
    expect(res).toBeDefined()
    // It should call NextResponse.next()
  })

  it("should block /api routes if not authenticated", () => {
    const req = createMockRequest("/api/boards")
    ;(getSessionCookie as any).mockReturnValue(null)
    const res = middleware(req)
    expect(res.status).toBe(401)
  })

  it("should allow /api routes if authenticated", () => {
    const req = createMockRequest("/api/boards")
    ;(getSessionCookie as any).mockReturnValue("valid-session")
    const res = middleware(req)
    expect(res.status).toBe(200)
  })

  it("should redirect authenticated users away from login", () => {
    const req = createMockRequest("/en/login")
    ;(getSessionCookie as any).mockReturnValue("valid-session")
    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/boards")
  })

  it("should redirect unauthenticated users to login", () => {
    const req = createMockRequest("/en/boards")
    ;(getSessionCookie as any).mockReturnValue(null)
    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toContain("/login")
  })
})
