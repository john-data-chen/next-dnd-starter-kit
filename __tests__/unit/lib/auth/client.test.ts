import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { authClient } from "@/lib/auth/client"

// Mock fetch
global.fetch = vi.fn()

describe("authClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("useSession", () => {
    it("should fetch session and return data", async () => {
      const mockSession = { user: { id: "1", email: "test@example.com", name: "Test User" } }
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSession)
      })

      const { result } = renderHook(() => authClient.useSession())

      expect(result.current.isPending).toBe(true)

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })

      expect(result.current.data).toEqual(mockSession)
    })

    it("should handle error when fetching session fails", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network error"))

      const { result } = renderHook(() => authClient.useSession())

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe("signIn.email", () => {
    it("should call sign-in API and return user data on success", async () => {
      const mockUser = { id: "1", email: "test@example.com", name: "Test User" }
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: mockUser })
      })

      const result = await authClient.signIn.email({ email: "test@example.com" })

      expect(global.fetch).toHaveBeenCalledWith("/api/auth/sign-in", expect.any(Object))
      expect(result.data?.user).toEqual(mockUser)
    })

    it("should return error if sign-in fails", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Invalid email" })
      })

      const result = await authClient.signIn.email({ email: "test@example.com" })

      expect(result.error?.code).toBe("INVALID_EMAIL_OR_PASSWORD")
    })
  })

  describe("signOut", () => {
    it("should call sign-out API", async () => {
      ;(global.fetch as any).mockResolvedValue({ ok: true })

      await authClient.signOut()

      expect(global.fetch).toHaveBeenCalledWith("/api/auth/sign-out", expect.any(Object))
    })
  })

  describe("getSession", () => {
    it("should return session data", async () => {
      const mockSession = { user: { id: "1", email: "test@example.com", name: "Test User" } }
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSession)
      })

      const result = await authClient.getSession()
      expect(result.data).toEqual(mockSession)
    })
  })
})
