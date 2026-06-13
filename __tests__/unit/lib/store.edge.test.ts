import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { defaultEmail } from "@/constants/demoData"
import * as dbBoard from "@/lib/db/board"
import * as dbProject from "@/lib/db/project"
import * as dbTask from "@/lib/db/task"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useBoardStore } from "@/lib/stores/board-store"
import { useProjectStore } from "@/lib/stores/project-store"
import { Project, Task, TaskStatus, UserInfo } from "@/types/dbInterface"

vi.mock("@/lib/db/board")
vi.mock("@/lib/db/project")
vi.mock("@/lib/db/task")

const mockUser: UserInfo = { id: "user-1", name: "Test User" }
const mockBoardId = "board-1"

const makeProject = (id: string, tasks: Task[] = []): Project => ({
  _id: id,
  title: `Project ${id}`,
  owner: mockUser,
  members: [mockUser],
  createdAt: new Date(),
  updatedAt: new Date(),
  tasks,
  board: mockBoardId
})

const makeTask = (id: string, projectId: string): Task => ({
  _id: id,
  title: `Task ${id}`,
  status: TaskStatus.TODO,
  board: mockBoardId,
  project: projectId,
  creator: mockUser,
  lastModifier: mockUser,
  createdAt: new Date(),
  updatedAt: new Date()
})

const resetStores = () => {
  act(() => {
    useAuthStore.setState(useAuthStore.getInitialState(), true)
    useBoardStore.setState(useBoardStore.getInitialState(), true)
    useProjectStore.setState(useProjectStore.getInitialState(), true)
  })
}

describe("Store edge cases", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    act(() => {
      useAuthStore.setState({ userEmail: defaultEmail, userId: mockUser.id })
      useBoardStore.setState({ currentBoardId: mockBoardId })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("useBoardStore failures", () => {
    it("addBoard throws the API error message when the response is not ok", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Boom" })
        } as Response)
      )
      await expect(useBoardStore.getState().addBoard("B", "d")).rejects.toThrow("Boom")
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it("addBoard throws a default message when no error field is returned", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response)
      )
      await expect(useBoardStore.getState().addBoard("B")).rejects.toThrow(
        "Failed to create board"
      )
    })

    it("updateBoard throws when the db returns a falsy result", async () => {
      vi.mocked(dbBoard.updateBoardInDb).mockResolvedValue(null as never)
      await expect(
        useBoardStore.getState().updateBoard(mockBoardId, { title: "x" })
      ).rejects.toThrow("Failed to update board")
    })

    it("removeBoard throws when the db reports failure", async () => {
      vi.mocked(dbBoard.deleteBoardInDb).mockResolvedValue(false)
      await expect(useBoardStore.getState().removeBoard(mockBoardId)).rejects.toThrow(
        "Failed to delete board"
      )
    })
  })

  describe("useProjectStore guards", () => {
    it("addProject throws when there is no current board", async () => {
      act(() => {
        useBoardStore.setState({ currentBoardId: null })
      })
      await expect(useProjectStore.getState().addProject("t", "d")).rejects.toThrow(
        "Board id not found"
      )
    })

    it("addProject throws when the db returns null", async () => {
      vi.mocked(dbProject.createProjectInDb).mockResolvedValue(null)
      await expect(useProjectStore.getState().addProject("t", "d")).rejects.toThrow(
        "Failed to create project"
      )
    })

    it("updateTask throws when the db returns null", async () => {
      act(() => {
        useProjectStore.setState({ projects: [makeProject("p1", [makeTask("t1", "p1")])] })
      })
      vi.mocked(dbTask.updateTaskInDb).mockResolvedValue(null as never)
      await expect(
        useProjectStore.getState().updateTask("t1", "x", TaskStatus.TODO)
      ).rejects.toThrow("Failed to update task")
    })

    it("fetchProjects falls back to empty tasks when task fetch fails", async () => {
      vi.mocked(dbProject.getProjectsFromDb).mockResolvedValue([makeProject("p1")])
      vi.mocked(dbTask.getTasksByProjectId).mockRejectedValue(new Error("task boom"))
      await act(async () => {
        await useProjectStore.getState().fetchProjects(mockBoardId)
      })
      const project = useProjectStore.getState().projects.find((p) => p._id === "p1")
      expect(project?.tasks).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe("updateProjectOrder", () => {
    it("reorders projects and persists the new order on success", async () => {
      act(() => {
        useProjectStore.setState({
          projects: [makeProject("p1"), makeProject("p2"), makeProject("p3")]
        })
      })
      vi.mocked(dbProject.updateProjectOrderInDb).mockResolvedValue(true)

      await act(async () => {
        await useProjectStore.getState().updateProjectOrder("p1", "p3")
      })

      expect(dbProject.updateProjectOrderInDb).toHaveBeenCalledWith(
        ["p2", "p3", "p1"],
        defaultEmail
      )
      expect(useProjectStore.getState().projects.map((p) => p._id)).toEqual(["p2", "p3", "p1"])
    })

    it("returns early when an id cannot be found", async () => {
      act(() => {
        useProjectStore.setState({ projects: [makeProject("p1")] })
      })
      await act(async () => {
        await useProjectStore.getState().updateProjectOrder("missing", "p1")
      })
      expect(dbProject.updateProjectOrderInDb).not.toHaveBeenCalled()
      expect(useProjectStore.getState().projects.map((p) => p._id)).toEqual(["p1"])
    })

    it("rolls back when the db reports failure", async () => {
      act(() => {
        useProjectStore.setState({ projects: [makeProject("p1"), makeProject("p2")] })
      })
      vi.mocked(dbProject.updateProjectOrderInDb).mockResolvedValue(false)
      await act(async () => {
        await useProjectStore.getState().updateProjectOrder("p1", "p2")
      })
      expect(useProjectStore.getState().projects.map((p) => p._id)).toEqual(["p1", "p2"])
    })

    it("rolls back and rethrows when the db call errors", async () => {
      act(() => {
        useProjectStore.setState({ projects: [makeProject("p1"), makeProject("p2")] })
      })
      vi.mocked(dbProject.updateProjectOrderInDb).mockRejectedValue(new Error("order boom"))
      await expect(
        act(async () => {
          await useProjectStore.getState().updateProjectOrder("p1", "p2")
        })
      ).rejects.toThrow("order boom")
      expect(useProjectStore.getState().projects.map((p) => p._id)).toEqual(["p1", "p2"])
    })
  })

  describe("dragTaskOnProject guards", () => {
    it("returns when the task cannot be found", async () => {
      act(() => {
        useProjectStore.setState({ projects: [makeProject("p1")] })
      })
      await act(async () => {
        await useProjectStore.getState().dragTaskOnProject("missing", "p1")
      })
      expect(dbTask.updateTaskProjectInDb).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith("Task not found")
    })

    it("returns when the source project cannot be resolved", async () => {
      const orphanTask = makeTask("t1", "ghost")
      act(() => {
        useProjectStore.setState({ projects: [makeProject("p1", [orphanTask])] })
      })
      await act(async () => {
        await useProjectStore.getState().dragTaskOnProject("t1", "p1")
      })
      expect(dbTask.updateTaskProjectInDb).not.toHaveBeenCalled()
    })

    it("returns when the db update fails", async () => {
      const t1 = makeTask("t1", "p1")
      act(() => {
        useProjectStore.setState({
          projects: [makeProject("p1", [t1]), makeProject("p2")]
        })
      })
      vi.mocked(dbTask.updateTaskProjectInDb).mockResolvedValue(null as never)
      await act(async () => {
        await useProjectStore.getState().dragTaskOnProject("t1", "p2")
      })
      expect(
        useProjectStore.getState().projects.find((p) => p._id === "p1")?.tasks
      ).toHaveLength(1)
    })

    it("leaves unrelated projects untouched when moving a task", async () => {
      const t1 = makeTask("t1", "p1")
      act(() => {
        useProjectStore.setState({
          projects: [makeProject("p1", [t1]), makeProject("p2"), makeProject("p3")]
        })
      })
      vi.mocked(dbTask.updateTaskProjectInDb).mockResolvedValue({ ...t1, project: "p2" })
      await act(async () => {
        await useProjectStore.getState().dragTaskOnProject("t1", "p2")
      })
      const state = useProjectStore.getState()
      expect(state.projects.find((p) => p._id === "p1")?.tasks).toHaveLength(0)
      expect(state.projects.find((p) => p._id === "p2")?.tasks).toHaveLength(1)
      expect(state.projects.find((p) => p._id === "p3")?.tasks).toHaveLength(0)
    })
  })

  describe("setProjects", () => {
    it("replaces the project list", () => {
      act(() => {
        useProjectStore.getState().setProjects([makeProject("p1"), makeProject("p2")])
      })
      expect(useProjectStore.getState().projects.map((p) => p._id)).toEqual(["p1", "p2"])
    })
  })
})
