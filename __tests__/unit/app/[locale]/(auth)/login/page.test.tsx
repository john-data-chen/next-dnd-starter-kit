import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import LoginPage, { generateMetadata } from "@/app/[locale]/(auth)/login/page"

// Mock next-intl
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async ({ locale, namespace }: { locale: string; namespace: string }) => {
    return (key: string) => {
      if (namespace === "login") {
        if (key === "title") return "Login"
        if (key === "description") return "Login to your account"
      }
      return key
    }
  })
}))

// Mock SignInView component
vi.mock("@/components/auth/SignInView", () => ({
  __esModule: true,
  default: () => <div data-testid="sign-in-view">Sign In View</div>
}))

describe("LoginPage", () => {
  it("should render SignInView component", async () => {
    const Component = await LoginPage()
    render(Component)
    expect(screen.getByTestId("sign-in-view")).toBeInTheDocument()
  })

  it("should generate metadata with correct title and description", async () => {
    const params = { locale: "en" }
    const metadata = await generateMetadata({ params: Promise.resolve(params) as any })

    expect(metadata.title).toBe("Login")
    expect(metadata.description).toBe("Login to your account")
  })

  it("should generate metadata for different locale", async () => {
    const params = { locale: "zh" }
    const metadata = await generateMetadata({ params: Promise.resolve(params) as any })

    expect(metadata.title).toBe("Login")
    expect(metadata.description).toBe("Login to your account")
  })
})
