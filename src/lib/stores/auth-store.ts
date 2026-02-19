import { create } from "zustand"
import { persist } from "zustand/middleware"

import { getUserByEmail } from "@/lib/db/user"

interface AuthState {
  userEmail: string | null
  userId: string | null
  setUserInfo: (email: string) => Promise<void>
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userEmail: null,
      userId: null,
      setUserInfo: async (email: string) => {
        try {
          const user = await getUserByEmail(email)
          if (!user) {
            console.error("User not found")
            return
          }
          set({ userEmail: email, userId: user.id })
        } catch (error) {
          console.error("Error in setUserInfo:", error)
        }
      },
      clearUser: () => set({ userEmail: null, userId: null })
    }),
    { name: "auth-store" }
  )
)
