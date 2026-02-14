import * as jose from "jose"
import { cookies } from "next/headers"
import { describe, expect, it, vi } from "vitest"

import { auth } from "@/lib/auth/server"

vi.mock("next/headers", () => ({
  cookies: vi.fn()
}))

vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
  jwtSign: vi.fn()
}))

describe("auth server", () => {
  it("should return null if no token is present", async () => {
    ;(cookies as any).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined)
    })

    const result = await auth()
    expect(result).toBeNull()
  })

  it("should return user if valid token is present", async () => {
    const mockPayload = { id: "1", email: "test@example.com", name: "Test User" }
    ;(cookies as any).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "valid-token" })
    })
    ;(jose.jwtVerify as any).mockResolvedValue({ payload: mockPayload })

    const result = await auth()
    expect(result).toEqual({
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User"
      }
    })
  })
})
