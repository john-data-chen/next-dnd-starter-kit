import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { ProjectActions } from "@/components/kanban/project/ProjectAction"
import { useBoardStore, useProjectStore } from "@/lib/stores"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: any) =>
    values?.error ? `${key}: ${values.error}` : key
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock("@/lib/stores", () => ({
  useBoardStore: vi.fn(),
  useProjectStore: vi.fn()
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children, onOpenChange }: any) => (
    <div data-testid="mock-dropdown">
      <button data-testid="mock-open-menu" onClick={() => onOpenChange(true)}>
        Open
      </button>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: any) => children,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, disabled }: any) => (
    <button onClick={onSelect} disabled={disabled} data-testid={`mock-item-${children}`}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />
}))

const mockUpdateProject = vi.fn()
const mockRemoveProject = vi.fn().mockResolvedValue(undefined)
const mockFetchProjects = vi.fn()

describe("ProjectActions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useBoardStore).mockImplementation((selector: any) =>
      selector({ currentBoardId: "board-1" })
    )
    vi.mocked(useProjectStore).mockImplementation((selector: any) =>
      selector({
        updateProject: mockUpdateProject,
        removeProject: mockRemoveProject,
        fetchProjects: mockFetchProjects
      })
    )
    global.fetch = vi.fn()
  })

  it("renders trigger button", () => {
    render(<ProjectActions id="1" title="Test Project" />)
    expect(screen.getByTestId("project-option-button")).toBeInTheDocument()
  })

  it("fetches permissions on menu open", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ canEditProject: true, canDeleteProject: true })
    } as Response)

    render(<ProjectActions id="1" title="Test Project" />)
    fireEvent.click(screen.getByTestId("mock-open-menu"))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/projects/1/permissions")
    })
  })

  it("handles fetch error gracefully", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"))

    render(<ProjectActions id="1" title="Test Project" />)
    fireEvent.click(screen.getByTestId("mock-open-menu"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Network error"))
    })
  })

  it("handles non-ok response from fetch", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Not allowed" })
    } as Response)

    render(<ProjectActions id="1" title="Test Project" />)
    fireEvent.click(screen.getByTestId("mock-open-menu"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Not allowed"))
    })
  })

  it("allows edit when permission granted", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ canEditProject: true, canDeleteProject: false })
    } as Response)

    render(<ProjectActions id="1" title="Test Project" description="Desc" />)
    fireEvent.click(screen.getByTestId("mock-open-menu"))

    await waitFor(() => {
      expect(screen.getByTestId("mock-item-edit")).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId("mock-item-edit"))
    expect(screen.getByText("editProjectTitle")).toBeInTheDocument()
  })

  it("allows delete when permission granted", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ canEditProject: false, canDeleteProject: true })
    } as Response)

    render(<ProjectActions id="1" title="Test Project" />)
    fireEvent.click(screen.getByTestId("mock-open-menu"))

    await waitFor(() => {
      expect(screen.getByTestId("mock-item-delete")).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId("mock-item-delete"))
    expect(screen.getByText("confirmDeleteDescription")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "delete" }))
    expect(mockRemoveProject).toHaveBeenCalledWith("1")
    expect(toast.success).toHaveBeenCalled()
  })

  it("handles form submit success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ canEditProject: true, canDeleteProject: false })
    } as Response)

    render(<ProjectActions id="1" title="Test Project" />)
    fireEvent.click(screen.getByTestId("mock-open-menu"))

    await waitFor(() => {
      expect(screen.getByTestId("mock-item-edit")).not.toBeDisabled()
    })
    fireEvent.click(screen.getByTestId("mock-item-edit"))

    mockUpdateProject.mockResolvedValueOnce(undefined)
    mockFetchProjects.mockResolvedValueOnce(undefined)

    await waitFor(() => {
      expect(screen.getByText("editProjectTitle")).toBeInTheDocument()
    })

    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: "Updated Title" } })
    fireEvent.click(screen.getByRole("button", { name: "save" }))

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith("1", "Updated Title", undefined)
      expect(mockFetchProjects).toHaveBeenCalledWith("board-1")
      expect(toast.success).toHaveBeenCalledWith("updateSuccess")
    })
  })

  it("handles form submit error", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ canEditProject: true, canDeleteProject: false })
    } as Response)

    render(<ProjectActions id="1" title="Test Project" />)
    fireEvent.click(screen.getByTestId("mock-open-menu"))

    await waitFor(() => {
      expect(screen.getByTestId("mock-item-edit")).not.toBeDisabled()
    })
    fireEvent.click(screen.getByTestId("mock-item-edit"))

    mockUpdateProject.mockRejectedValueOnce(new Error("Update failed"))

    await waitFor(() => {
      expect(screen.getByText("editProjectTitle")).toBeInTheDocument()
    })

    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: "Updated Title" } })
    fireEvent.click(screen.getByRole("button", { name: "save" }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Update failed"))
    })
  })
})
