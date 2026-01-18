import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserNav } from "@/components/layout/UserNav"
import { ROUTES } from "@/constants/routes"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth/client"

import { render, screen } from "../../test-utils"

// Mock dependencies
vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: vi.fn(),
    signOut: vi.fn()
  }
}))

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn()
}))

vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>()
  return {
    ...actual,
    useTranslations: () => (key: string) => key
  }
})

interface MockSession {
  user: {
    id: string
    name: string
    email: string
    image: string
  }
}

describe("UserNav Component", () => {
  const mockSession: MockSession = {
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      image: "https://example.com/avatar.png"
    }
  }

  const mockRouterPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockRouterPush
    } as any)
  })

  it("should render nothing when there is no session", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
      error: null
    } as any)
    const { container } = render(<UserNav />)
    expect(container.querySelector('button[aria-haspopup="menu"]')).not.toBeInTheDocument()
  })

  it("should render the user avatar button when session exists", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null
    } as any)
    render(<UserNav />)
    const avatarButton = screen.getByRole("button")
    expect(avatarButton).toBeInTheDocument()
  })

  it("should open dropdown, show user info and logout option on button click", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null
    } as any)
    const user = userEvent.setup()
    render(<UserNav />)
    const avatarButton = screen.getByRole("button")

    await user.click(avatarButton)

    expect(screen.getByText(mockSession.user?.name ?? "")).toBeInTheDocument()
    expect(screen.getByText(mockSession.user?.email ?? "")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "logOut" })).toBeInTheDocument()
  })

  it("should call signOut and then router.push on logout click", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null
    } as any)
    vi.mocked(authClient.signOut).mockResolvedValue({} as any)
    const user = userEvent.setup()
    render(<UserNav />)
    const avatarButton = screen.getByRole("button")

    await user.click(avatarButton)
    const logoutMenuItem = screen.getByRole("menuitem", { name: "logOut" })
    await user.click(logoutMenuItem)

    expect(vi.mocked(authClient.signOut)).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN)
  })

  it("should handle sign out errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const testError = new Error("Sign out failed")
    vi.mocked(authClient.signOut).mockRejectedValueOnce(testError)
    vi.mocked(authClient.useSession).mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null
    } as any)

    const user = userEvent.setup()
    render(<UserNav />)
    const avatarButton = screen.getByRole("button")

    await user.click(avatarButton)
    const logoutMenuItem = screen.getByRole("menuitem", { name: "logOut" })
    await user.click(logoutMenuItem)

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(testError)
    })

    consoleErrorSpy.mockRestore()
  })
})
