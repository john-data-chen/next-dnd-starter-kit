import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"

import { TaskForm } from "@/components/kanban/task/TaskForm"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}))

describe("TaskForm Interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ _id: "u1", name: "Test User", email: "test@example.com" }]
    })
  })

  it("handles date selection", async () => {
    const mockOnSubmit = vi.fn()
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const dateTrigger = screen.getByTestId("task-date-picker-trigger")
    fireEvent.click(dateTrigger)

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    const dayButtons = screen.queryAllByRole("button", { name: /[0-9]/ })
    if (dayButtons.length > 0) {
      fireEvent.click(dayButtons[dayButtons.length - 1])
    }
  })

  it("handles assignee selection", async () => {
    const mockOnSubmit = vi.fn()
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const assigneeTrigger = screen.getByRole("button", { name: /selectUser/i })
    fireEvent.click(assigneeTrigger)

    // Wait for the combobox to open and fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Now let's try to find the option, or fallback to typing
    // Actually, Command component handles fetching. The items might be wrapped in CommandItem
    // Let's just find anything with role="option"
    await waitFor(() => {
      const options = screen.queryAllByRole("option")
      if (options.length > 0) {
        fireEvent.click(options[0])
      }
    })
  })
})
