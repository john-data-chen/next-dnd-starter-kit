"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  image?: string
}

interface Session {
  user: User | null
}

interface UseSessionResult {
  data: Session | null
  isPending: boolean
  error: Error | null
}

interface SignInResult {
  data?: { user: User }
  error?: { code: string; message: string }
}

// Custom auth client for password less demo mode
export const authClient = {
  // Hook to get current session
  useSession(): UseSessionResult {
    const [data, setData] = useState<Session | null>(null)
    const [isPending, setIsPending] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
      const fetchSession = async () => {
        try {
          const res = await fetch("/api/auth/session")
          const session = await res.json()
          setData(session)
        } catch (err) {
          setError(err instanceof Error ? err : new Error("Failed to fetch session"))
        } finally {
          setIsPending(false)
        }
      }

      fetchSession().catch(() => {})
    }, [])

    return { data, isPending, error }
  },

  // Sign in with email (password less)
  signIn: {
    async email({ email }: { email: string; password?: string }): Promise<SignInResult> {
      try {
        const res = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        })

        const data = await res.json()

        if (!res.ok) {
          return {
            error: {
              code: res.status === 401 ? "INVALID_EMAIL_OR_PASSWORD" : "UNKNOWN_ERROR",
              message: data.error || "Authentication failed"
            }
          }
        }

        return { data: { user: data.user } }
      } catch (err) {
        return {
          error: {
            code: "NETWORK_ERROR",
            message: err instanceof Error ? err.message : "Network error"
          }
        }
      }
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    await fetch("/api/auth/sign-out", { method: "POST" })
  },

  // Get session (non-hook version)
  async getSession(): Promise<{ data: Session | null }> {
    try {
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      return { data: session }
    } catch {
      return { data: null }
    }
  }
}
