"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { defaultEmail } from "@/constants/demoData"
import { ROUTES } from "@/constants/routes"
import { NAVIGATION_DELAY_MS } from "@/constants/ui"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth/client"
import { useAuthStore } from "@/lib/stores"
import { SignInFormValue, SignInValidation } from "@/types/authUserForm"

interface AuthFormState {
  message?: string
  status: "error" | "success" | "idle" | "loading"
}

export default function useAuthForm() {
  const [isNavigating, startNavigationTransition] = useTransition()
  const setUserInfo = useAuthStore((state) => state.setUserInfo)
  const router = useRouter()
  const params = useParams()
  const [status, setStatus] = useState<AuthFormState>({ status: "idle" })
  const t = useTranslations("login")

  const form = useForm<SignInFormValue>({
    resolver: zodResolver(SignInValidation),
    defaultValues: {
      email: defaultEmail
    }
  })

  const onSubmit = (data: SignInFormValue) => {
    const signInProcessPromise = async () => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: "" // Required by better-auth but not used in our password less flow
      })

      if (result.error) {
        if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") {
          throw new Error("Invalid email, retry again.")
        }
        throw new Error(result.error.message || "Authentication failed.")
      }
      await setUserInfo(data.email)
    }

    toast.promise(signInProcessPromise(), {
      loading: "Authenticating...",
      success: () => {
        const navigationDelay = NAVIGATION_DELAY_MS
        const locale = (params.locale as string) || "en"
        const targetPath = `${ROUTES.BOARDS.ROOT}?login_success=true`

        setTimeout(() => {
          startNavigationTransition(() => {
            // Provide the base path and the target locale separately.
            // The router will construct the correct path (e.g., /de/boards).
            router.push(targetPath, { locale })
          })
        }, navigationDelay)

        return t("authSuccessRedirect")
      },
      error: (err: Error) => {
        console.error("Sign-in promise error:", err)
        setStatus({ status: "error", message: err.message })
        return err.message || "An unknown authentication error occurred."
      }
    })
  }

  return {
    form,
    loading: isNavigating,
    onSubmit,
    status
  }
}
