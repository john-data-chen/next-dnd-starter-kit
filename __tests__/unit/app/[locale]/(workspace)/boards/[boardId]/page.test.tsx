import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import BoardPage from "@/app/[locale]/(workspace)/boards/[boardId]/page"
import { useBoardStore } from "@/lib/stores/board-store"
import { useProjectStore } from "@/lib/stores/project-store"

const mockUseParams = vi.fn(() => ({ boardId: "test-board-id" }))

vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams()
}))

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}))

const setCurrentBoardIdMock = vi.fn()
const fetchProjectsMock = vi.fn()

vi.mock("@/lib/stores/board-store", () => ({
  useBoardStore: (selector: (state: any) => any) =>
    selector({
      setCurrentBoardId: setCurrentBoardIdMock
    })
}))

vi.mock("@/lib/stores/project-store", () => ({
  useProjectStore: (selector: (state: any) => any) =>
    selector({
      fetchProjects: fetchProjectsMock
    })
}))

vi.mock("@/components/kanban/board/Board", () => ({
  Board: () => <div data-testid="mock-board">Mock Board</div>
}))

vi.mock("@/components/layout/PageContainer", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-page-container">{children}</div>
  )
}))

const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

describe("BoardPage", () => {
  beforeEach(() => {
    setCurrentBoardIdMock.mockClear()
    fetchProjectsMock.mockClear()
    consoleErrorSpy.mockClear()
    mockUseParams.mockReturnValue({ boardId: "test-board-id" })
  })

  it("should render the board and call store actions on mount", () => {
    render(<BoardPage />)

    expect(screen.getByTestId("mock-page-container")).toBeInTheDocument()
    expect(screen.getByTestId("mock-board")).toBeInTheDocument()
    expect(setCurrentBoardIdMock).toHaveBeenCalledWith("test-board-id")
    expect(fetchProjectsMock).toHaveBeenCalledWith("test-board-id")
  })

  it("should not call store actions when boardId is undefined", () => {
    mockUseParams.mockReturnValue({ boardId: undefined as unknown as string })

    render(<BoardPage />)

    expect(screen.getByTestId("mock-page-container")).toBeInTheDocument()
    expect(setCurrentBoardIdMock).not.toHaveBeenCalled()
    expect(fetchProjectsMock).not.toHaveBeenCalled()
  })

  it("should handle errors when fetching projects fails", async () => {
    const testError = new Error("Failed to fetch projects")
    fetchProjectsMock.mockRejectedValueOnce(testError)

    render(<BoardPage />)

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
