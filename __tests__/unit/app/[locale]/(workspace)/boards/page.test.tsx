import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import BoardPage, { generateMetadata } from "@/app/[locale]/(workspace)/boards/page"

// Mock server-only modules
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async ({ locale, namespace }: { locale: string; namespace: string }) => {
    return (key: string) => {
      if (namespace === "kanban") {
        if (key === "title") return "Boards"
        if (key === "description") return "Manage your boards"
      }
      return key
    }
  })
}))

// Mock child components
vi.mock("@/components/kanban/BoardOverview", () => ({
  BoardOverview: () => <div data-testid="board-overview">BoardOverview</div>
}))

describe("BoardPage", () => {
  it("should render BoardOverview component", () => {
    render(<BoardPage />)
    expect(screen.getByTestId("board-overview")).toBeInTheDocument()
  })

  it("should generate metadata with correct title and description", async () => {
    const params = { locale: "en" }
    const metadata = await generateMetadata({ params: Promise.resolve(params) as any })

    expect(metadata.title).toBe("Boards")
    expect(metadata.description).toBe("Manage your boards")
  })

  it("should generate metadata for different locale", async () => {
    const params = { locale: "zh" }
    const metadata = await generateMetadata({ params: Promise.resolve(params) as any })

    expect(metadata.title).toBe("Boards")
    expect(metadata.description).toBe("Manage your boards")
  })
})
