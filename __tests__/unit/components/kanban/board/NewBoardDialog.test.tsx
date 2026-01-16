import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { vi } from "vitest"

import NewBoardDialog from "@/components/kanban/board/NewBoardDialog"

// Mock useTaskStore
const addBoardMock = vi.fn().mockResolvedValue("mock-board-id")
vi.mock("@/lib/store", () => ({
  useTaskStore: () => ({
    addBoard: addBoardMock
  })
}))

// Mock useBoards
const fetchBoardsMock = vi.fn()
vi.mock("@/hooks/useBoards", () => ({
  useBoards: () => ({
    fetchBoards: fetchBoardsMock
  })
}))

// Mock useRouter from i18n
const pushMock = vi.fn()
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}))

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}))

// Mock toast
const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => {
  return { toastSuccessMock: vi.fn(), toastErrorMock: vi.fn() }
})
vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock
  }
}))

// Mock BoardForm to allow submission
vi.mock("@/components/kanban/board/BoardForm", () => ({
  BoardForm: ({ onSubmit, children }: any) => (
    <form
      data-testid="mock-board-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ title: "Test Board", description: "desc" })
      }}
    >
      {children}
    </form>
  )
}))

describe("NewBoardDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addBoardMock.mockResolvedValue("mock-board-id")
  })

  it("should open dialog, submit, and show success toast with translated message", async () => {
    render(
      <NewBoardDialog>
        <button data-testid="new-board-trigger">New Board</button>
      </NewBoardDialog>
    )

    // Open dialog
    fireEvent.click(screen.getByTestId("new-board-trigger"))
    await screen.findByTestId("new-board-dialog-title")

    // Check for translated title and description
    expect(screen.getByTestId("new-board-dialog-title")).toHaveTextContent("newBoardTitle")
    expect(screen.getByText("newBoardDescription")).toBeInTheDocument()

    // Submit form
    fireEvent.click(screen.getByTestId("create-button"))

    // Verify actions and toast
    await waitFor(() => {
      expect(addBoardMock).toHaveBeenCalledWith("Test Board", "desc")
    })

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("boardCreatedSuccess")
    })

    await waitFor(() => {
      expect(fetchBoardsMock).toHaveBeenCalled()
      expect(pushMock).toHaveBeenCalledWith("/boards/mock-board-id")
    })
  })

  it("should handle errors when board creation fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    const testError = new Error("Failed to create board")
    addBoardMock.mockRejectedValueOnce(testError)

    render(
      <NewBoardDialog>
        <button data-testid="new-board-trigger">New Board</button>
      </NewBoardDialog>
    )

    // Open dialog and submit
    fireEvent.click(screen.getByTestId("new-board-trigger"))
    await screen.findByTestId("new-board-dialog-title")
    fireEvent.click(screen.getByTestId("create-button"))

    // Verify error handling
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(testError)
      expect(toastErrorMock).toHaveBeenCalledWith("boardCreateFailed")
    })

    consoleErrorSpy.mockRestore()
  })

  it("should close dialog when cancel button is clicked", async () => {
    render(
      <NewBoardDialog>
        <button data-testid="new-board-trigger">New Board</button>
      </NewBoardDialog>
    )

    // Open dialog
    fireEvent.click(screen.getByTestId("new-board-trigger"))
    const title = await screen.findByTestId("new-board-dialog-title")
    expect(title).toBeInTheDocument()

    // Find and click cancel
    const cancelButton = screen.getByTestId("cancel-button")
    expect(cancelButton).toBeInTheDocument()
    fireEvent.click(cancelButton)

    // Verify addBoard was not called
    expect(addBoardMock).not.toHaveBeenCalled()
  })
})
