import { act, renderHook, waitFor } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { defaultEmail } from "@/constants/demoData"
import { ROUTES } from "@/constants/routes"
import useAuthForm from "@/hooks/useAuthForm"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth/client"
import { useTaskStore } from "@/lib/store"

import { AllTheProviders } from "../test-utils"

// --- Mock Area ---
vi.mock("@/lib/store")
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signIn: {
      email: vi.fn()
    },
    signOut: vi.fn(),
    useSession: vi.fn(() => ({ data: null, isPending: false, error: null }))
  }
}))
vi.mock("sonner")
vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn()
}))
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
  usePathname: vi.fn(),
  Link: vi.fn()
}))
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>()
  return {
    ...actual,
    useTranslations: vi.fn()
  }
})
// --- End Mock Area ---

describe("useAuthForm", () => {
  const mockSetUserInfo = vi.fn()
  const mockRouterPush = vi.fn()
  const mockToastPromise = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // vi.useFakeTimers();

    vi.mocked(useTaskStore).mockReturnValue({
      setUserInfo: mockSetUserInfo
    } as any)

    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush
    } as any)

    vi.mocked(useParams).mockReturnValue({
      locale: "en"
    })

    vi.mocked(useTranslations).mockImplementation(
      (namespace) =>
        Object.assign((key: string) => `${namespace}.${key}`, {
          rich: (key: string) => key,
          markup: (key: string) => key,
          raw: (key: string) => key,
          has: (key: string) => !!key
        }) as any
    )

    vi.mocked(toast).promise = mockToastPromise
  })

  afterEach(() => {
    // vi.useRealTimers();
    vi.clearAllMocks()
  })

  it("should initialize the form email with the default value", () => {
    const { result } = renderHook(() => useAuthForm(), {
      wrapper: AllTheProviders
    })
    expect(result.current.form.getValues("email")).toBe(defaultEmail)
  })

  it("successful login flow: calls signIn, setUserInfo, and navigates after delay", async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: { user: { id: "1" } },
      error: null
    } as any)

    mockToastPromise.mockImplementation((promise, options) => {
      promise.then(options.success).catch(options.error)
      return promise
    })

    const { result } = renderHook(() => useAuthForm(), {
      wrapper: AllTheProviders
    })

    await act(async () => {
      await result.current.onSubmit({ email: defaultEmail })
    })

    expect(authClient.signIn.email).toHaveBeenCalledWith({
      email: defaultEmail,
      password: ""
    })
    expect(mockSetUserInfo).toHaveBeenCalledWith(defaultEmail)

    expect(mockToastPromise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: "Authenticating...",
      success: expect.any(Function),
      error: expect.any(Function)
    })

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(`${ROUTES.BOARDS.ROOT}?login_success=true`, {
        locale: "en"
      })
    })
  })

  it("should handle INVALID_EMAIL_OR_PASSWORD error", async () => {
    const error = { error: { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid credentials" } }
    vi.mocked(authClient.signIn.email).mockResolvedValue(error as any)

    let capturedError: Error | undefined
    mockToastPromise.mockImplementation((promise, options) => {
      promise.catch((e: Error) => {
        capturedError = e
        options.error(e)
      })
      return promise
    })

    const { result } = renderHook(() => useAuthForm(), {
      wrapper: AllTheProviders
    })

    await act(async () => {
      await result.current.onSubmit({ email: "fail@example.com" })
    })

    await waitFor(() => {
      expect(capturedError).toBeDefined()
      expect(capturedError?.message).toContain("Invalid email, retry again.")
    })

    expect(mockSetUserInfo).not.toHaveBeenCalled()
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it("should handle other signIn errors", async () => {
    const errorMessage = "Some other error"
    const error = { error: { code: "UNKNOWN_ERROR", message: errorMessage } }
    vi.mocked(authClient.signIn.email).mockResolvedValue(error as any)

    let capturedError: Error | undefined
    mockToastPromise.mockImplementation((promise, options) => {
      promise.catch((e: Error) => {
        capturedError = e
        options.error(e)
      })
      return promise
    })

    const { result } = renderHook(() => useAuthForm(), {
      wrapper: AllTheProviders
    })

    await act(async () => {
      await result.current.onSubmit({ email: "fail@example.com" })
    })

    await waitFor(() => {
      expect(capturedError).toBeDefined()
      expect(capturedError?.message).toContain(errorMessage)
    })
  })
})
