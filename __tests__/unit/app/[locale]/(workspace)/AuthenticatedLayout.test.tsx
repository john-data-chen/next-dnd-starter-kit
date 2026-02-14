import { render, screen } from "@testing-library/react"
import { redirect } from "next/navigation"
import React from "react"
import { describe, expect, it, vi } from "vitest"

import AuthenticatedLayout from "@/app/[locale]/(workspace)/AuthenticatedLayout"
import { ROUTES } from "@/constants/routes"

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn()
}))
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key)
}))
vi.mock("@/components/layout/RootWrapper", () => ({
  default: ({ children }: any) => <div data-testid="root-wrapper">{children}</div>
}))

describe("AuthenticatedLayout", () => {
  it("should redirect to login if no session", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue(null)

    try {
      const Component = await AuthenticatedLayout({
        locale: "en",
        children: <div>Test</div>
      })
      render(Component)
    } catch (e) {
      // In Next.js, redirect() throws an error that is caught by the framework
    }

    expect(redirect).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN)
  })

  it("should render RootWrapper if session exists", async () => {
    const { auth } = await import("@/lib/auth")
    ;(auth as any).mockResolvedValue({ user: { id: "1", name: "Test User" } })

    const Component = await AuthenticatedLayout({
      locale: "en",
      children: <div data-testid="child">Test</div>
    })
    render(Component)

    expect(screen.getByTestId("root-wrapper")).toBeInTheDocument()
    expect(screen.getByTestId("child")).toBeInTheDocument()
  })
})
