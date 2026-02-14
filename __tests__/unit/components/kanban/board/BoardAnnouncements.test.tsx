import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"
import { render } from "@testing-library/react"
import React from "react"
import { vi } from "vitest"

import { Board } from "@/components/kanban/board/Board"
import { Project, Task, TaskStatus, UserInfo } from "@/types/dbInterface"

// --- Hoisted Mocks & Variables ---
let mockProjectsData: Project[] = []
let mockIsLoadingProjectsData = false
let mockFilterData: { status?: TaskStatus | null; search?: string } = {}

vi.mock("@/lib/store", () => ({
  useTaskStore: (selector: (state: any) => any) => {
    const state = {
      projects: mockProjectsData,
      isLoadingProjects: mockIsLoadingProjectsData,
      filter: mockFilterData,
      setProjects: vi.fn(),
      dragTaskOnProject: vi.fn(),
      updateProjectOrder: vi.fn()
    }
    return selector(state)
  }
}))

let capturedAccessibility: any | undefined

vi.mock("@dnd-kit/core", async (importOriginal: () => Promise<any>) => {
  const actual = (await importOriginal()) as typeof import("@dnd-kit/core")
  return {
    ...actual,
    DndContext: vi.fn(({ children, accessibility }: React.PropsWithChildren<any>) => {
      capturedAccessibility = accessibility
      return <div data-testid="dnd-context-wrapper">{children}</div>
    }),
    DragOverlay: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="drag-overlay">{children}</div>
    ),
    MouseSensor: actual.MouseSensor,
    TouchSensor: actual.TouchSensor,
    useSensor: actual.useSensor,
    useSensors: actual.useSensors
  }
})

vi.mock("@/components/kanban/project/NewProjectDialog", () => ({
  default: () => <div data-testid="new-project-dialog" />
}))

vi.mock("@/components/kanban/project/Project", () => ({
  BoardContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="board-container">{children}</div>
  ),
  BoardProject: () => <div data-testid="board-project" />
}))

vi.mock("@/components/kanban/task/TaskCard", () => ({
  TaskCard: () => <div data-testid="task-card" />
}))

vi.mock("@/components/kanban/task/TaskFilter", () => ({
  TaskFilter: () => <div data-testid="task-filter" />
}))

// --- Test Data ---
const user1: UserInfo = { id: "u1", name: "User1" }
const task1P1: Task = {
  _id: "task1-p1",
  title: "Task 1 P1",
  status: TaskStatus.TODO,
  project: "project1",
  board: "b1",
  creator: user1,
  lastModifier: user1,
  createdAt: new Date(),
  updatedAt: new Date()
}

const project1Initial: Project = {
  _id: "project1",
  title: "Project One",
  tasks: [task1P1],
  owner: user1,
  members: [user1],
  board: "b1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const project2Initial: Project = {
  _id: "project2",
  title: "Project Two",
  tasks: [],
  owner: user1,
  members: [user1],
  board: "b1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

describe("Board Announcements", () => {
  beforeEach(() => {
    mockProjectsData = [project1Initial, project2Initial]
    mockIsLoadingProjectsData = false
    mockFilterData = {}
    capturedAccessibility = undefined
  })

  it("should provide correct announcement on drag start for Project", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements
    const event = {
      active: {
        id: "project1",
        data: { current: { type: "Project", project: project1Initial } }
      }
    } as unknown as DragStartEvent

    const result = announcements.onDragStart(event)
    expect(result).toBe("Picked up Project Project One at position: 1 of 2")
  })

  it("should provide correct announcement on drag start for Task", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements
    const event = {
      active: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      }
    } as unknown as DragStartEvent

    const result = announcements.onDragStart(event)
    expect(result).toBe("Picked up Task Task 1 P1 at position: 1 of 1 in project Project One")
  })

  it("should provide correct announcement on drag over for Project", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements
    const event = {
      active: {
        id: "project1",
        data: { current: { type: "Project", project: project1Initial } }
      },
      over: {
        id: "project2",
        data: { current: { type: "Project", project: project2Initial } }
      }
    } as unknown as DragOverEvent

    const result = announcements.onDragOver(event)
    expect(result).toBe("Project Project One was moved over Project Two at position 2 of 2")
  })

  it("should provide correct announcement on drag over for Task (same project)", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements

    // Set pickedUpTaskProject by calling onDragStart
    announcements.onDragStart({
      active: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      }
    } as unknown as DragStartEvent)

    const event = {
      active: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      },
      over: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      }
    } as unknown as DragOverEvent

    const result = announcements.onDragOver(event)
    expect(result).toBe("Task was moved over position 1 of 1 in project Project One")
  })

  it("should provide correct announcement on drag over for Task (different project)", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements

    const task2 = { ...task1P1, _id: "task2", title: "Task 2", project: "project2" }
    announcements.onDragStart({
      active: {
        id: "task2",
        data: { current: { type: "Task", task: task2 } }
      }
    } as unknown as DragStartEvent)

    const event = {
      active: {
        id: "task2",
        data: { current: { type: "Task", task: task2 } }
      },
      over: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      }
    } as unknown as DragOverEvent

    const result = announcements.onDragOver(event)
    expect(result).toBe("Task Task 2 was moved over project Project One in position 1 of 1")
  })

  it("should provide correct announcement on drag end for Task (same project)", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements

    announcements.onDragStart({
      active: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      }
    } as unknown as DragStartEvent)

    const event = {
      active: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      },
      over: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      }
    } as unknown as DragEndEvent

    const result = announcements.onDragEnd(event)
    expect(result).toBe("Task was dropped into position 1 of 1 in project Project One")
  })

  it("should provide correct announcement on drag end for Task (different project)", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements

    const task2 = { ...task1P1, _id: "task2", title: "Task 2", project: "project2" }
    announcements.onDragStart({
      active: {
        id: "task2",
        data: { current: { type: "Task", task: task2 } }
      }
    } as unknown as DragStartEvent)

    const event = {
      active: {
        id: "task2",
        data: { current: { type: "Task", task: task2 } }
      },
      over: {
        id: "task1-p1",
        data: { current: { type: "Task", task: task1P1 } }
      }
    } as unknown as DragEndEvent

    const result = announcements.onDragEnd(event)
    expect(result).toBe("Task was dropped into project Project One in position 1 of 1")
  })

  it("should provide correct announcement on drag end for Project", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements
    const event = {
      active: {
        id: "project1",
        data: { current: { type: "Project", project: project1Initial } }
      },
      over: {
        id: "project2",
        data: { current: { type: "Project", project: project2Initial } }
      }
    } as unknown as DragEndEvent

    const result = announcements.onDragEnd(event)
    expect(result).toBe("Project Project One was dropped into position 2 of 2")
  })

  it("should provide correct announcement on drag cancel", () => {
    render(<Board />)
    const announcements = capturedAccessibility.announcements
    const event = {
      active: {
        id: "project1",
        data: { current: { type: "Project", project: project1Initial } }
      }
    } as any

    const result = announcements.onDragCancel(event)
    expect(result).toBe("Dragging Project cancelled.")
  })
})
