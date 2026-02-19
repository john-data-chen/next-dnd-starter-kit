import { act } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { defaultEmail } from "@/constants/demoData"
import * as dbBoard from "@/lib/db/board"
import * as dbProject from "@/lib/db/project"
import * as dbTask from "@/lib/db/task"
import * as dbUser from "@/lib/db/user"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useBoardStore } from "@/lib/stores/board-store"
import { useProjectStore } from "@/lib/stores/project-store"
import { Board, Project, Task, TaskStatus, UserInfo } from "@/types/dbInterface"

vi.mock("@/lib/db/user")
vi.mock("@/lib/db/board")
vi.mock("@/lib/db/project")
vi.mock("@/lib/db/task")

const resetAllStores = () => {
  act(() => {
    useAuthStore.setState(useAuthStore.getInitialState(), true)
    useBoardStore.setState(useBoardStore.getInitialState(), true)
    useProjectStore.setState(useProjectStore.getInitialState(), true)
  })
}

describe("Zustand Stores", () => {
  const mockUser: UserInfo = { id: "user-1", name: "Test User" }
  const mockFullUser = {
    id: "user-1",
    name: "Test User",
    email: defaultEmail
  }
  const mockUserEmail = defaultEmail
  const mockBoardId = "board-1"
  const mockProjectId = "project-1"
  const mockTaskId = "task-1"

  const mockProject: Project = {
    _id: mockProjectId,
    title: "Test Project",
    owner: mockUser,
    members: [mockUser],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
    board: mockBoardId
  }

  const mockTask: Task = {
    _id: mockTaskId,
    title: "Test Task",
    status: TaskStatus.TODO,
    board: mockBoardId,
    project: mockProjectId,
    creator: mockUser,
    lastModifier: mockUser,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    resetAllStores()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("useAuthStore", () => {
    it("should have correct initial state", () => {
      const state = useAuthStore.getState()
      expect(state.userEmail).toBeNull()
      expect(state.userId).toBeNull()
    })

    describe("setUserInfo", () => {
      it("should set user email and id on successful fetch", async () => {
        vi.mocked(dbUser.getUserByEmail).mockResolvedValue(mockFullUser)
        await act(async () => {
          await useAuthStore.getState().setUserInfo(mockUserEmail)
        })
        const state = useAuthStore.getState()
        expect(dbUser.getUserByEmail).toHaveBeenCalledWith(mockUserEmail)
        expect(state.userEmail).toBe(mockUserEmail)
        expect(state.userId).toBe(mockFullUser.id)
      })

      it("should log error if user not found", async () => {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        vi.mocked(dbUser.getUserByEmail).mockResolvedValue(null)

        await act(async () => {
          await useAuthStore.getState().setUserInfo("notfound@example.com")
        })

        expect(consoleErrorSpy).toHaveBeenCalledWith("User not found")
        consoleErrorSpy.mockRestore()
      })
    })

    describe("clearUser", () => {
      it("should clear user info", async () => {
        vi.mocked(dbUser.getUserByEmail).mockResolvedValue(mockFullUser)
        await act(async () => {
          await useAuthStore.getState().setUserInfo(mockUserEmail)
        })
        expect(useAuthStore.getState().userEmail).toBe(mockUserEmail)

        act(() => {
          useAuthStore.getState().clearUser()
        })
        expect(useAuthStore.getState().userEmail).toBeNull()
        expect(useAuthStore.getState().userId).toBeNull()
      })
    })
  })

  describe("useBoardStore", () => {
    beforeEach(() => {
      act(() => {
        useAuthStore.setState({ userEmail: mockUserEmail, userId: mockUser.id })
      })
    })

    it("should have correct initial state", () => {
      resetAllStores()
      const state = useBoardStore.getState()
      expect(state.currentBoardId).toBeNull()
      expect(state.myBoards).toEqual([])
      expect(state.teamBoards).toEqual([])
    })

    describe("Board Actions", () => {
      it("setCurrentBoardId should update currentBoardId", () => {
        const newBoardId = "board-new"
        act(() => {
          useBoardStore.getState().setCurrentBoardId(newBoardId)
        })
        expect(useBoardStore.getState().currentBoardId).toBe(newBoardId)
      })

      it("addBoard should call fetch API and update state", async () => {
        const mockResponse = { success: true, boardId: "new-board-id" }
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResponse)
          } as Response)
        )

        let boardId = ""
        await act(async () => {
          boardId = await useBoardStore.getState().addBoard("New Board", "Desc")
        })

        expect(global.fetch).toHaveBeenCalledWith("/api/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Board", description: "Desc" })
        })
        expect(boardId).toBe("new-board-id")
        expect(useBoardStore.getState().currentBoardId).toBe("new-board-id")
      })

      it("addBoard should throw error if userEmail is null", async () => {
        act(() => {
          useAuthStore.setState({ userEmail: null })
        })
        await expect(useBoardStore.getState().addBoard("New Board")).rejects.toThrow(
          "User email not found"
        )
      })

      it("updateBoard should call updateBoardInDb", async () => {
        vi.mocked(dbBoard.updateBoardInDb).mockResolvedValue({} as any)
        const updateData = { title: "Updated Board Title" }
        await act(async () => {
          await useBoardStore.getState().updateBoard(mockBoardId, updateData)
        })
        expect(dbBoard.updateBoardInDb).toHaveBeenCalledWith(mockBoardId, updateData, mockUserEmail)
      })

      it("removeBoard should call deleteBoardInDb", async () => {
        vi.mocked(dbBoard.deleteBoardInDb).mockResolvedValue(true)
        await act(async () => {
          await useBoardStore.getState().removeBoard(mockBoardId)
        })
        expect(dbBoard.deleteBoardInDb).toHaveBeenCalledWith(mockBoardId, mockUserEmail)
      })

      it("setMyBoards should update myBoards state", () => {
        const boards: Board[] = [{ _id: "b1", title: "My Board 1" } as Board]
        act(() => {
          useBoardStore.getState().setMyBoards(boards)
        })
        expect(useBoardStore.getState().myBoards).toEqual(boards)
      })

      it("setTeamBoards should update teamBoards state", () => {
        const boards: Board[] = [{ _id: "b2", title: "Team Board 1" } as Board]
        act(() => {
          useBoardStore.getState().setTeamBoards(boards)
        })
        expect(useBoardStore.getState().teamBoards).toEqual(boards)
      })

      it("resetBoards should reset relevant state", () => {
        act(() => {
          useBoardStore.setState({
            myBoards: [{ _id: "b1" } as Board],
            teamBoards: [{ _id: "b2" } as Board],
            currentBoardId: "some-board"
          })
        })
        act(() => {
          useBoardStore.getState().resetBoards()
        })
        const state = useBoardStore.getState()
        expect(state.myBoards).toEqual([])
        expect(state.teamBoards).toEqual([])
        expect(state.currentBoardId).toBeNull()
      })
    })
  })

  describe("useProjectStore", () => {
    beforeEach(() => {
      act(() => {
        useAuthStore.setState({ userEmail: mockUserEmail, userId: mockUser.id })
        useBoardStore.setState({ currentBoardId: mockBoardId })
      })
    })

    it("should have correct initial state", () => {
      resetAllStores()
      const state = useProjectStore.getState()
      expect(state.projects).toEqual([])
      expect(state.isLoadingProjects).toBe(false)
      expect(state.filter).toEqual({ status: null, search: "" })
    })

    describe("Project Actions", () => {
      it("fetchProjects should fetch projects and their tasks and manage isLoadingProjects state", async () => {
        const project1: Project = { ...mockProject, _id: "p1", tasks: [] }
        const project2: Project = { ...mockProject, _id: "p2", tasks: [] }
        const task1: Task = { ...mockTask, _id: "t1", project: "p1" }
        const task2: Task = { ...mockTask, _id: "t2", project: "p2" }

        vi.mocked(dbProject.getProjectsFromDb).mockResolvedValue([project1, project2])
        vi.mocked(dbTask.getTasksByProjectId)
          .mockResolvedValueOnce([task1])
          .mockResolvedValueOnce([task2])

        expect(useProjectStore.getState().isLoadingProjects).toBe(false)

        const fetchPromise = act(async () => {
          await useProjectStore.getState().fetchProjects(mockBoardId)
        })

        expect(useProjectStore.getState().isLoadingProjects).toBe(true)

        await fetchPromise

        expect(dbProject.getProjectsFromDb).toHaveBeenCalledWith(mockBoardId)
        expect(dbTask.getTasksByProjectId).toHaveBeenCalledWith("p1")
        expect(dbTask.getTasksByProjectId).toHaveBeenCalledWith("p2")
        expect(useProjectStore.getState().projects).toEqual([
          { ...project1, tasks: [task1] },
          { ...project2, tasks: [task2] }
        ])
        expect(useProjectStore.getState().isLoadingProjects).toBe(false)
      })

      it("fetchProjects should set empty array and isLoadingProjects to false if no projects found", async () => {
        vi.mocked(dbProject.getProjectsFromDb).mockResolvedValue([])

        expect(useProjectStore.getState().isLoadingProjects).toBe(false)
        const fetchPromise = act(async () => {
          await useProjectStore.getState().fetchProjects(mockBoardId)
        })
        expect(useProjectStore.getState().isLoadingProjects).toBe(true)
        await fetchPromise

        expect(useProjectStore.getState().projects).toEqual([])
        expect(dbTask.getTasksByProjectId).not.toHaveBeenCalled()
        expect(useProjectStore.getState().isLoadingProjects).toBe(false)
      })

      it("fetchProjects should set isLoadingProjects to false on error", async () => {
        vi.mocked(dbProject.getProjectsFromDb).mockRejectedValue(new Error("DB Error"))

        expect(useProjectStore.getState().isLoadingProjects).toBe(false)
        await act(async () => {
          try {
            await useProjectStore.getState().fetchProjects(mockBoardId)
          } catch (e) {}
        })
        expect(useProjectStore.getState().projects).toEqual([])
        expect(useProjectStore.getState().isLoadingProjects).toBe(false)
      })

      it("addProject should add a project to the state", async () => {
        const newProject = {
          ...mockProject,
          _id: "new-project-id",
          title: "New Project",
          description: "New Desc"
        }
        vi.mocked(dbProject.createProjectInDb).mockResolvedValue(newProject)

        let projectId = ""
        await act(async () => {
          projectId = await useProjectStore.getState().addProject("New Project", "New Desc")
        })

        expect(dbProject.createProjectInDb).toHaveBeenCalledWith({
          title: "New Project",
          description: "New Desc",
          userEmail: mockUserEmail,
          board: mockBoardId
        })
        expect(projectId).toBe("new-project-id")
        expect(useProjectStore.getState().projects).toContainEqual(newProject)
      })

      it("updateProject should update a project in the state", async () => {
        act(() => {
          useProjectStore.setState({ projects: [mockProject] })
        })
        vi.mocked(dbProject.updateProjectInDb).mockResolvedValue(null)

        const updatedTitle = "Updated Project Title"
        await act(async () => {
          await useProjectStore
            .getState()
            .updateProject(mockProjectId, updatedTitle, "Updated Desc")
        })

        expect(dbProject.updateProjectInDb).toHaveBeenCalledWith({
          projectId: mockProjectId,
          userEmail: mockUserEmail,
          newTitle: updatedTitle,
          newDescription: "Updated Desc"
        })
        const updatedProject = useProjectStore
          .getState()
          .projects.find((p) => p._id === mockProjectId)
        expect(updatedProject?.title).toBe(updatedTitle)
      })

      it("removeProject should remove a project from the state", async () => {
        act(() => {
          useProjectStore.setState({ projects: [mockProject] })
        })
        vi.mocked(dbProject.deleteProjectInDb).mockResolvedValue(true)

        await act(async () => {
          await useProjectStore.getState().removeProject(mockProjectId)
        })

        expect(dbProject.deleteProjectInDb).toHaveBeenCalledWith(mockProjectId, mockUserEmail)
        expect(useProjectStore.getState().projects).toHaveLength(0)
      })
    })

    describe("Task Actions", () => {
      beforeEach(() => {
        act(() => {
          useProjectStore.setState({ projects: [{ ...mockProject, tasks: [] }] })
        })
      })

      it("addTask should add a task to the correct project", async () => {
        const newTaskData = {
          title: "New Task",
          status: TaskStatus.TODO,
          description: "Task Desc",
          dueDate: new Date(),
          assigneeId: "assignee-1"
        }
        const createdTask: Task = {
          ...mockTask,
          _id: "new-task-id",
          title: newTaskData.title,
          status: newTaskData.status,
          description: newTaskData.description,
          dueDate: newTaskData.dueDate,
          assignee: newTaskData.assigneeId
            ? { id: newTaskData.assigneeId, name: "Assignee Name" }
            : undefined,
          project: mockProjectId
        }
        vi.mocked(dbTask.createTaskInDb).mockResolvedValue(createdTask)

        await act(async () => {
          await useProjectStore
            .getState()
            .addTask(
              mockProjectId,
              newTaskData.title,
              newTaskData.status,
              newTaskData.description,
              newTaskData.dueDate,
              newTaskData.assigneeId
            )
        })

        expect(dbTask.createTaskInDb).toHaveBeenCalledWith(
          mockProjectId,
          newTaskData.title,
          mockUserEmail,
          newTaskData.description,
          newTaskData.dueDate,
          newTaskData.assigneeId,
          newTaskData.status
        )
        const project = useProjectStore.getState().projects.find((p) => p._id === mockProjectId)
        const addedTask = project?.tasks.find((t) => t._id === "new-task-id")
        expect(addedTask).toBeDefined()
        expect(addedTask?.status).toBe(TaskStatus.TODO)
      })

      it("updateTask should update a task within its project", async () => {
        const initialTask: Task = { ...mockTask, project: mockProjectId }
        act(() => {
          useProjectStore.setState({
            projects: [{ ...mockProject, tasks: [initialTask] }]
          })
        })

        const updateData = {
          title: "Updated Task",
          status: TaskStatus.IN_PROGRESS,
          description: "Updated Desc",
          dueDate: new Date(),
          assigneeId: "assignee-2"
        }
        const updatedTaskResult: Task = {
          ...initialTask,
          title: updateData.title,
          status: updateData.status,
          description: updateData.description,
          dueDate: updateData.dueDate,
          assignee: updateData.assigneeId
            ? { id: updateData.assigneeId, name: "Assignee 2 Name" }
            : undefined,
          lastModifier: mockUser
        }
        vi.mocked(dbTask.updateTaskInDb).mockResolvedValue(updatedTaskResult)

        await act(async () => {
          await useProjectStore
            .getState()
            .updateTask(
              mockTaskId,
              updateData.title,
              updateData.status,
              updateData.description,
              updateData.dueDate,
              updateData.assigneeId
            )
        })

        expect(dbTask.updateTaskInDb).toHaveBeenCalledWith(
          mockTaskId,
          updateData.title,
          mockUserEmail,
          updateData.status,
          updateData.description,
          updateData.dueDate,
          updateData.assigneeId
        )
        const project = useProjectStore.getState().projects.find((p) => p._id === mockProjectId)
        const updatedTaskInState = project?.tasks.find((t) => t._id === mockTaskId)
        expect(updatedTaskInState).toBeDefined()
        expect(updatedTaskInState?.status).toBe(TaskStatus.IN_PROGRESS)
      })

      it("removeTask should remove a task from its project", async () => {
        const taskToRemove = { ...mockTask, project: mockProjectId }
        act(() => {
          useProjectStore.setState({
            projects: [{ ...mockProject, tasks: [taskToRemove] }]
          })
        })
        vi.mocked(dbTask.deleteTaskInDb).mockResolvedValue(undefined)

        await act(async () => {
          await useProjectStore.getState().removeTask(mockTaskId)
        })

        expect(dbTask.deleteTaskInDb).toHaveBeenCalledWith(mockTaskId)
        const project = useProjectStore.getState().projects.find((p) => p._id === mockProjectId)
        expect(project?.tasks).toHaveLength(0)
      })

      it("dragTaskOnProject should move task between projects", async () => {
        const taskInProject1 = { ...mockTask, _id: mockTaskId, project: "p1" }
        const project1 = { ...mockProject, _id: "p1", tasks: [taskInProject1] }
        const project2 = { ...mockProject, _id: "p2", tasks: [] }
        const updatedTask = { ...taskInProject1, project: "p2" }

        act(() => {
          useProjectStore.setState({ projects: [project1, project2] })
        })
        vi.mocked(dbTask.updateTaskProjectInDb).mockResolvedValue(updatedTask)

        await act(async () => {
          await useProjectStore.getState().dragTaskOnProject(mockTaskId, "p2")
        })

        expect(dbTask.updateTaskProjectInDb).toHaveBeenCalledWith(mockUserEmail, mockTaskId, "p2")
        const state = useProjectStore.getState()
        expect(state.projects.find((p) => p._id === "p1")?.tasks).toHaveLength(0)
        expect(state.projects.find((p) => p._id === "p2")?.tasks).toContainEqual(
          expect.objectContaining({
            _id: mockTaskId,
            project: "p2"
          })
        )
      })

      it("dragTaskOnProject should reorder task within the same project", async () => {
        const task1 = { ...mockTask, _id: "t1", project: mockProjectId }
        const task2 = { ...mockTask, _id: "t2", project: mockProjectId }
        const project = { ...mockProject, tasks: [task1, task2] }

        act(() => {
          useProjectStore.setState({ projects: [project] })
        })

        await act(async () => {
          await useProjectStore.getState().dragTaskOnProject("t1", mockProjectId)
        })

        expect(dbTask.updateTaskProjectInDb).not.toHaveBeenCalled()

        const finalProject = useProjectStore
          .getState()
          .projects.find((p) => p._id === mockProjectId)
        expect(finalProject?.tasks).toEqual([task2, task1])
      })
    })

    describe("Filter Actions", () => {
      it("setFilter should update the filter state", () => {
        act(() => {
          useProjectStore.getState().setFilter({ status: "DONE", search: "keyword" })
        })
        expect(useProjectStore.getState().filter).toEqual({
          status: "DONE",
          search: "keyword"
        })

        act(() => {
          useProjectStore.getState().setFilter({ search: "new keyword" })
        })
        expect(useProjectStore.getState().filter).toEqual({
          status: "DONE",
          search: "new keyword"
        })
      })
    })
  })
})
