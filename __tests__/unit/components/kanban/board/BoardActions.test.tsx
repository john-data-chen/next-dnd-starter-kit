import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { vi } from "vitest"

import { BoardActions } from "@/components/kanban/board/BoardActions"

const updateBoardMock = vi.fn().mockResolvedValue(undefined)
const removeBoardMock = vi.fn().mockResolvedValue(undefined)

vi.mock("@/lib/stores/board-store", () => ({
  useBoardStore: (selector: any) =>
    selector({
      updateBoard: updateBoardMock,
      removeBoard: removeBoardMock
    })
}))

vi.mock("@/lib/stores/auth-store", () => ({
  useAuthStore: () => ({
    userEmail: "test@example.com"
  })
}))

const fetchBoardsMock = vi.fn()
vi.mock("@/hooks/useBoards", () => ({
  useBoards: () => ({
    fetchBoards: fetchBoardsMock
  })
}))

const refreshMock = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}))

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: any) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}))

const toastMocks = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn()
}))

vi.mock("sonner", () => ({
  toast: {
    success: toastMocks.toastSuccessMock,
    error: toastMocks.toastErrorMock
  }
}))

vi.mock("@/components/kanban/board/BoardForm", () => ({
  BoardForm: ({
    onSubmit,
    children,
    defaultValues
  }: {
    onSubmit: (values: { title: string; description: string }) => void
    children: React.ReactNode
    defaultValues: { title: string; description: string }
  }) => (
    <form
      data-testid="board-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ title: "Edited Title", description: "Edited Desc" })
      }}
    >
      <input defaultValue={defaultValues.title} data-testid="board-title-input" />
      <textarea defaultValue={defaultValues.description} data-testid="board-description-input" />
      {children}
    </form>
  )
}))

vi.mock("@/components/ui/dropdown-menu", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/components/ui/dropdown-menu")>()
  return {
    ...original,
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({
      children,
      onSelect,
      ...props
    }: {
      children: React.ReactNode
      onSelect?: (event: Event) => void
      [key: string]: any
    }) => (
      <button {...props} onClick={(e) => onSelect?.(e as unknown as Event)}>
        {children}
      </button>
    ),
    DropdownMenuSeparator: () => <hr data-testid="mock-separator" />
  }
})

describe("BoardActions", () => {
  const board = {
    _id: "b1",
    title: "Test Board",
    description: "desc",
    owner: { id: "u1", name: "User1" },
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should open edit dialog when edit item is clicked", async () => {
    render(<BoardActions board={board} />)
    const editButton = screen.getByTestId("edit-board-button")
    fireEvent.click(editButton)

    await screen.findByText("editBoardTitle")
    expect(screen.getByText("editBoardDescription")).toBeInTheDocument()

    const saveButton = screen.getByRole("button", { name: "saveChanges" })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(updateBoardMock).toHaveBeenCalledWith("b1", {
        title: "Edited Title",
        description: "Edited Desc"
      })
    })

    await waitFor(() => {
      expect(toastMocks.toastSuccessMock).toHaveBeenCalled()
    })
  })

  it("should open delete dialog when delete item is clicked", async () => {
    render(<BoardActions board={board} />)
    const deleteButtonDropdown = screen.getByTestId("delete-board-button")
    fireEvent.click(deleteButtonDropdown)

    await screen.findByText('confirmDeleteTitle {"title":"Test Board"}')
    expect(screen.getByText("confirmDeleteDescription")).toBeInTheDocument()

    const confirmDeleteButton = screen.getByRole("button", { name: "delete" })
    fireEvent.click(confirmDeleteButton)

    await waitFor(() => {
      expect(removeBoardMock).toHaveBeenCalledWith("b1")
    })
  })

  it("should show error toast if updateBoard fails", async () => {
    const error = new Error("Update failed")
    updateBoardMock.mockRejectedValueOnce(error)
    render(<BoardActions board={board} />)

    const editButton = screen.getByTestId("edit-board-button")
    fireEvent.click(editButton)

    await screen.findByText("editBoardTitle")
    const saveButton = screen.getByRole("button", { name: "saveChanges" })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(toastMocks.toastErrorMock).toHaveBeenCalled()
    })
  })

  it("should show error toast if removeBoard fails", async () => {
    const error = new Error("Delete failed")
    removeBoardMock.mockRejectedValueOnce(error)
    render(<BoardActions board={board} />)

    const deleteButtonDropdown = screen.getByTestId("delete-board-button")
    fireEvent.click(deleteButtonDropdown)

    await screen.findByText('confirmDeleteTitle {"title":"Test Board"}')
    const confirmDeleteButton = screen.getByRole("button", { name: "delete" })
    fireEvent.click(confirmDeleteButton)

    await waitFor(() => {
      expect(toastMocks.toastErrorMock).toHaveBeenCalled()
    })
  })
})
