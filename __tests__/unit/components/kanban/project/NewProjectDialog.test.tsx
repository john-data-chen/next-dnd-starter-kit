import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { vi } from "vitest"

import NewProjectDialog from "@/components/kanban/project/NewProjectDialog"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useBoardStore } from "@/lib/stores/board-store"
import { useProjectStore } from "@/lib/stores/project-store"

const addProjectMock = vi.fn().mockResolvedValue("mock-project-id")
vi.mock("@/lib/stores/project-store", () => ({
  useProjectStore: (selector: any) =>
    selector({
      addProject: addProjectMock
    })
}))

vi.mock("@/lib/stores/auth-store", () => ({
  useAuthStore: () => ({
    userEmail: "test@example.com"
  })
}))

vi.mock("@/lib/stores/board-store", () => ({
  useBoardStore: () => ({
    currentBoardId: "test-board-id"
  })
}))

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}))

const { toastSuccessMock } = vi.hoisted(() => {
  return { toastSuccessMock: vi.fn() }
})
vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: vi.fn()
  }
}))

vi.mock("@/components/kanban/project/ProjectForm", () => ({
  ProjectForm: ({ onSubmit, children }: any) => (
    <form
      data-testid="mock-project-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ title: "Test Project", description: "Test Description" })
      }}
    >
      {children}
    </form>
  )
}))

describe("NewProjectDialog", () => {
  it("should open dialog and submit new project", async () => {
    render(<NewProjectDialog />)
    fireEvent.click(screen.getByTestId("new-project-trigger"))
    await screen.findByTestId("new-project-dialog")

    expect(screen.getByText("addNewProjectTitle")).toBeInTheDocument()
    expect(screen.getByText("addNewProjectDescription")).toBeInTheDocument()

    fireEvent.submit(screen.getByTestId("mock-project-form"))

    await waitFor(() => {
      expect(addProjectMock).toHaveBeenCalledWith("Test Project", "Test Description")
    })

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("createSuccess")
    })
  })
})
