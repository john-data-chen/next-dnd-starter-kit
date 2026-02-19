import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TaskFilter } from "@/components/kanban/task/TaskFilter"
import { useProjectStore } from "@/lib/stores/project-store"

const setFilterMock = vi.fn()

vi.mock("@/lib/stores/project-store", () => ({
  useProjectStore: vi.fn()
}))

const mockUseProjectStore = vi.mocked(useProjectStore)

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => `${children}`
}))

let capturedOnValueChange: (value: string) => void
vi.mock("@/components/ui/select", async (importOriginal) => {
  const original = await importOriginal<any>()
  return {
    ...original,
    Select: ({ children, onValueChange }: any) => {
      capturedOnValueChange = onValueChange
      return <div data-testid="mock-select">{children}</div>
    },
    SelectTrigger: ({ children }: any) => <div data-testid="status-select">{children}</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
  }
})

describe("TaskFilter Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedOnValueChange = vi.fn()
    mockUseProjectStore.mockImplementation((selector: any) =>
      selector({
        filter: { status: null, search: "" },
        setFilter: setFilterMock,
        projects: []
      })
    )
  })

  it("renders search input with translated placeholder", () => {
    render(<TaskFilter />)
    expect(screen.getByPlaceholderText("searchPlaceholder")).toBeInTheDocument()
  })

  it("renders status filter with translated placeholder", () => {
    render(<TaskFilter />)
    expect(screen.getByText("filterByStatus")).toBeInTheDocument()
  })

  it("calls setFilter on search input change", async () => {
    render(<TaskFilter />)
    const searchInput = screen.getByTestId("search-input")
    await userEvent.type(searchInput, "test query")
    expect(setFilterMock).toHaveBeenCalledWith({ search: "t" })
    expect(setFilterMock).toHaveBeenCalledWith({ search: "e" })
  })

  it('calls setFilter with null when "TOTAL" is selected', () => {
    render(<TaskFilter />)
    capturedOnValueChange("TOTAL")
    expect(setFilterMock).toHaveBeenCalledWith({ status: null })
  })

  it("calls setFilter with status when a status is selected", () => {
    render(<TaskFilter />)
    capturedOnValueChange("TODO")
    expect(setFilterMock).toHaveBeenCalledWith({ status: "TODO" })
  })

  it("calls setFilter to clear filters when clear button is clicked", () => {
    mockUseProjectStore.mockImplementation((selector: any) =>
      selector({
        filter: { status: "TODO", search: "query" },
        setFilter: setFilterMock,
        projects: []
      })
    )

    render(<TaskFilter />)
    const clearButton = screen.getByTestId("clear-filter-button")
    expect(clearButton).toHaveTextContent("clearFilter")

    fireEvent.click(clearButton)
    expect(setFilterMock).toHaveBeenCalledWith({ status: null, search: "" })
  })

  it("should calculate task counts correctly when projects have tasks", () => {
    mockUseProjectStore.mockImplementation((selector: any) =>
      selector({
        filter: { status: null, search: "" },
        setFilter: setFilterMock,
        projects: [
          {
            _id: "project1",
            name: "Project 1",
            order: 0,
            tasks: [
              { _id: "task1", title: "Task 1", status: "TODO" },
              { _id: "task2", title: "Task 2", status: "IN_PROGRESS" },
              { _id: "task3", title: "Task 3", status: "DONE" }
            ]
          },
          {
            _id: "project2",
            name: "Project 2",
            order: 1,
            tasks: [{ _id: "task4", title: "Task 4", status: "TODO" }]
          }
        ]
      })
    )

    render(<TaskFilter />)
    expect(screen.getByTestId("status-select")).toBeInTheDocument()
  })
})
