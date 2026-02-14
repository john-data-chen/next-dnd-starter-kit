import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

// Mock dependencies before importing the component
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key)
}))

vi.mock("@/lib/auth", () => ({
  auth: vi.fn()
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn()
  })),
  useSearchParams: vi.fn(() => new URLSearchParams())
}))

vi.mock("@/app/[locale]/(workspace)/AuthenticatedLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-layout">{children}</div>
  )
}))

import AppLayout from "@/app/[locale]/(workspace)/layout"

describe("AppLayout", () => {
  const mockParams = Promise.resolve({ locale: "en" })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render children if session exists", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: "1" } })

    const result = await AppLayout({
      children: <div>Test</div>,
      params: mockParams
    })
    render(result)

    await waitFor(() => {
      expect(screen.getByTestId("authenticated-layout")).toBeInTheDocument()
    })
    expect(screen.getByText("Test")).toBeInTheDocument()
  })
})
