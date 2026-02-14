import { render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"

import MessagesProvider from "@/app/[locale]/MessagesProvider"

// Mock dependencies
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: any) => <div data-testid="intl-provider">{children}</div>
}))

vi.mock("next-intl/server", () => ({
  getMessages: vi.fn(() => Promise.resolve({ test: "message" }))
}))

vi.mock("@/components/layout/Providers", () => ({
  default: ({ children }: any) => <div data-testid="layout-providers">{children}</div>
}))

describe("MessagesProvider", () => {
  it("should render NextIntlClientProvider and Providers with children", async () => {
    const Component = await MessagesProvider({
      locale: "en",
      children: <div data-testid="child">Test</div>
    })
    render(Component)

    expect(screen.getByTestId("intl-provider")).toBeInTheDocument()
    expect(screen.getByTestId("layout-providers")).toBeInTheDocument()
    expect(screen.getByTestId("child")).toBeInTheDocument()
  })
})
