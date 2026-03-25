import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { BoardActions } from "@/components/kanban/board/BoardActions"
import { useBoards } from "@/hooks/useBoards"
import { useBoardStore } from "@/lib/stores"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: any) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn()
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock("@/lib/stores", () => ({
  useBoardStore: vi.fn()
}))

vi.mock("@/hooks/useBoards", () => ({
  useBoards: vi.fn()
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="mock-dropdown">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => children,
  DropdownMenuContent: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, "data-testid": testId }: any) => (
    <button onClick={onSelect} data-testid={testId}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />
}))

const mockUpdateBoard = vi.fn()
const mockRemoveBoard = vi.fn()
const mockFetchBoards = vi.fn()
const mockRouterRefresh = vi.fn()

const mockBoard = {
  _id: "board-1",
  title: "Test Board",
  description: "Test Desc",
  owner: { id: "u1", name: "User" },
  members: [],
  createdAt: new Date(),
  updatedAt: new Date()
}

describe("BoardActions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useBoardStore).mockImplementation((selector: any) =>
      selector({
        updateBoard: mockUpdateBoard,
        removeBoard: mockRemoveBoard
      })
    )
    vi.mocked(useBoards).mockReturnValue({ fetchBoards: mockFetchBoards } as any)
    vi.mocked(useRouter).mockReturnValue({ refresh: mockRouterRefresh } as any)
  })

  it("renders trigger button", () => {
    render(<BoardActions board={mockBoard as any} />)
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument()
  })

  it("renders custom trigger if asChild is true", () => {
    render(
      <BoardActions board={mockBoard as any} asChild>
        <button data-testid="custom-trigger">Custom</button>
      </BoardActions>
    )
    expect(screen.getByTestId("custom-trigger")).toBeInTheDocument()
  })

  it("handles edit form success", async () => {
    mockUpdateBoard.mockResolvedValueOnce(undefined)

    render(<BoardActions board={mockBoard as any} />)

    // Click edit in the mocked dropdown menu
    fireEvent.click(screen.getByTestId("edit-board-button"))

    await waitFor(() => {
      expect(screen.getByText("editBoardTitle")).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText(/titleLabel/i)
    fireEvent.change(titleInput, { target: { value: "Updated Board Title" } })

    fireEvent.click(screen.getByRole("button", { name: /saveChanges/i }))

    await waitFor(() => {
      expect(mockUpdateBoard).toHaveBeenCalledWith(
        "board-1",
        expect.objectContaining({ title: "Updated Board Title" })
      )
      expect(mockFetchBoards).toHaveBeenCalled()
      expect(mockRouterRefresh).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalled()
    })
  })

  it("handles edit form error", async () => {
    mockUpdateBoard.mockRejectedValueOnce(new Error("Update Error"))

    render(<BoardActions board={mockBoard as any} />)
    fireEvent.click(screen.getByTestId("edit-board-button"))

    await waitFor(() => {
      expect(screen.getByText("editBoardTitle")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /saveChanges/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it("handles delete success", async () => {
    const mockOnDelete = vi.fn()
    mockRemoveBoard.mockResolvedValueOnce(undefined)

    render(<BoardActions board={mockBoard as any} onDelete={mockOnDelete} />)
    fireEvent.click(screen.getByTestId("delete-board-button"))

    await waitFor(() => {
      expect(screen.getByText(/confirmDeleteTitle/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /delete/i }))

    await waitFor(() => {
      expect(mockRemoveBoard).toHaveBeenCalledWith("board-1")
      expect(mockOnDelete).toHaveBeenCalled()
      expect(mockFetchBoards).toHaveBeenCalled()
      expect(mockRouterRefresh).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalled()
    })
  })

  it("handles delete error", async () => {
    mockRemoveBoard.mockRejectedValueOnce(new Error("Delete Error"))

    render(<BoardActions board={mockBoard as any} />)
    fireEvent.click(screen.getByTestId("delete-board-button"))

    await waitFor(() => {
      expect(screen.getByText(/confirmDeleteTitle/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: /delete/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
