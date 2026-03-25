import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import BoardError from "@/app/[locale]/(workspace)/boards/[boardId]/error"
import WorkspaceError from "@/app/[locale]/(workspace)/error"
import NotFound from "@/app/[locale]/not-found"
import GlobalError from "@/app/global-error"
import { ROUTES } from "@/constants/routes"

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

describe("Error Components", () => {
  const mockReset = vi.fn()
  const error = new Error("Test error message")

  it("GlobalError renders correctly", () => {
    render(<GlobalError error={error} reset={mockReset} />)
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument()
    expect(screen.getByText("Test error message")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Try again"))
    expect(mockReset).toHaveBeenCalled()
  })

  it("WorkspaceError renders correctly", () => {
    render(<WorkspaceError error={error} reset={mockReset} />)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("Test error message")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Try again"))
    expect(mockReset).toHaveBeenCalled()
  })

  it("BoardError renders correctly", () => {
    render(<BoardError error={error} reset={mockReset} />)
    expect(screen.getByText("Failed to load board")).toBeInTheDocument()
    expect(screen.getByText("Test error message")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Try again"))
    expect(mockReset).toHaveBeenCalled()
  })

  it("NotFound renders correctly", () => {
    render(<NotFound />)
    expect(screen.getByText("404")).toBeInTheDocument()
    expect(screen.getByText("Page not found")).toBeInTheDocument()
    expect(screen.getByText("Go to Boards")).toHaveAttribute("href", ROUTES.BOARDS.ROOT)
  })
})
