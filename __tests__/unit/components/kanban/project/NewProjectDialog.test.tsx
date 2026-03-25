import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import { describe, expect, it, vi, beforeEach } from "vitest"

import NewProjectDialog from "@/components/kanban/project/NewProjectDialog"
import { useProjectStore } from "@/lib/stores"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock("@/lib/stores", () => ({
  useProjectStore: vi.fn()
}))

const mockAddProject = vi.fn()

describe("NewProjectDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useProjectStore).mockImplementation((selector: any) =>
      selector({ addProject: mockAddProject })
    )
  })

  it("renders trigger button", () => {
    render(<NewProjectDialog />)
    expect(screen.getByTestId("new-project-trigger")).toBeInTheDocument()
  })

  it("opens dialog on click", async () => {
    render(<NewProjectDialog />)
    fireEvent.click(screen.getByTestId("new-project-trigger"))
    await waitFor(() => {
      expect(screen.getByText("addNewProjectTitle")).toBeInTheDocument()
    })
  })

  it("submits form successfully", async () => {
    mockAddProject.mockResolvedValueOnce("new-project-id")
    const mockOnAdd = vi.fn()

    render(<NewProjectDialog onProjectAdd={mockOnAdd} />)
    fireEvent.click(screen.getByTestId("new-project-trigger"))

    await waitFor(() => {
      expect(screen.getByText("addNewProjectTitle")).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText("titleLabel")
    fireEvent.change(titleInput, { target: { value: "New Proj" } })

    fireEvent.click(screen.getByRole("button", { name: "addProject" }))

    await waitFor(() => {
      expect(mockAddProject).toHaveBeenCalledWith("New Proj", "")
      expect(mockOnAdd).toHaveBeenCalledWith("New Proj", "")
      expect(toast.success).toHaveBeenCalledWith("createSuccess")
    })
  })

  it("handles empty projectId return", async () => {
    mockAddProject.mockResolvedValueOnce(null)

    render(<NewProjectDialog />)
    fireEvent.click(screen.getByTestId("new-project-trigger"))

    await waitFor(() => {
      expect(screen.getByText("addNewProjectTitle")).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText("titleLabel")
    fireEvent.change(titleInput, { target: { value: "New Proj" } })

    fireEvent.click(screen.getByRole("button", { name: "addProject" }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("createFailed")
    })
  })

  it("handles exception during submit", async () => {
    mockAddProject.mockRejectedValueOnce(new Error("Network error"))

    render(<NewProjectDialog />)
    fireEvent.click(screen.getByTestId("new-project-trigger"))

    await waitFor(() => {
      expect(screen.getByText("addNewProjectTitle")).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText("titleLabel")
    fireEvent.change(titleInput, { target: { value: "New Proj" } })

    fireEvent.click(screen.getByRole("button", { name: "addProject" }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("createFailed")
    })
  })

  it("closes dialog on cancel", async () => {
    render(<NewProjectDialog />)
    fireEvent.click(screen.getByTestId("new-project-trigger"))

    await waitFor(() => {
      expect(screen.getByText("addNewProjectTitle")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "cancel" }))

    await waitFor(() => {
      expect(screen.queryByText("addNewProjectTitle")).not.toBeInTheDocument()
    })
  })
})
