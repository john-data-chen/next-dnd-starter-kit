import { arrayMove } from "@dnd-kit/sortable"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import { Board, Project } from "@/types/dbInterface"

// oxlint-disable-next-line no-unused-vars
import { createBoardInDb, deleteBoardInDb, updateBoardInDb } from "./db/board"
import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb,
  updateProjectOrderInDb
} from "./db/project"
import {
  createTaskInDb,
  deleteTaskInDb,
  getTasksByProjectId,
  updateTaskInDb,
  updateTaskProjectInDb
} from "./db/task"
import { getUserByEmail } from "./db/user"

interface State {
  userEmail: string | null
  userId: string | null
  setUserInfo: (email: string) => Promise<void>
  projects: Project[]
  isLoadingProjects: boolean
  fetchProjects: (boardId: string) => Promise<void>
  setProjects: (projects: Project[]) => void
  addProject: (title: string, description: string) => Promise<string>
  updateProject: (id: string, newTitle: string, newDescription?: string) => Promise<void>
  removeProject: (id: string) => Promise<void>
  updateProjectOrder: (activeId: string, overId: string) => Promise<void>
  addTask: (
    projectId: string,
    title: string,
    status: "TODO" | "IN_PROGRESS" | "DONE",
    description?: string,
    dueDate?: Date,
    assigneeId?: string
  ) => Promise<void>
  updateTask: (
    taskId: string,
    title: string,
    status: "TODO" | "IN_PROGRESS" | "DONE",
    description?: string,
    dueDate?: Date,
    assigneeId?: string
  ) => Promise<void>
  removeTask: (taskId: string) => Promise<void>
  dragTaskOnProject: (taskId: string, newProjectId: string) => Promise<void>
  filter: {
    status: string | null
    search: string
  }
  setFilter: (filter: Partial<State["filter"]>) => void
  currentBoardId: string | null
  setCurrentBoardId: (boardId: string) => void
  addBoard: (title: string, description?: string) => Promise<string>
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>
  removeBoard: (id: string) => Promise<void>
  myBoards: Board[]
  teamBoards: Board[]
  setMyBoards: (boards: Board[]) => void
  setTeamBoards: (boards: Board[]) => void
  resetInBoards: () => void
}

export const useTaskStore = create<State>()(
  persist(
    (set) => ({
      userEmail: null,
      userId: null,
      projects: [] as Project[],
      isLoadingProjects: false,
      setUserInfo: async (email: string) => {
        try {
          const user = await getUserByEmail(email)
          if (!user) {
            console.error("User not found")
            return
          }
          set({ userEmail: email, userId: user.id })
        } catch (error) {
          console.error("Error in setUserInfo:", error)
        }
      },
      fetchProjects: async (boardId: string) => {
        set({ isLoadingProjects: true })
        try {
          const projects = await getProjectsFromDb(boardId)
          if (!projects || projects.length === 0) {
            set({ projects: [] })
            return
          }

          const projectsWithTasks = await Promise.all(
            projects.map(async (project) => {
              try {
                const tasks = await getTasksByProjectId(project._id)
                return {
                  ...project,
                  tasks: tasks || []
                }
              } catch (error) {
                console.error(`Error fetching tasks for project ${project._id}:`, error)
                return {
                  ...project,
                  tasks: []
                }
              }
            })
          )

          set({ projects: projectsWithTasks })
        } catch (error) {
          console.error("Error fetching projects:", error)
          set({ projects: [] })
        } finally {
          set({ isLoadingProjects: false }) // Set loading to false when done
        }
      },
      setProjects: (projects: Project[]) => set({ projects }),
      addProject: async (title: string, description: string) => {
        try {
          const state = useTaskStore.getState()
          if (!state.userEmail || !state.currentBoardId) {
            throw new Error("User email or board id not found")
          }

          const newProject = await createProjectInDb({
            title,
            description,
            userEmail: state.userEmail,
            board: state.currentBoardId
          })

          if (newProject) {
            set((state) => ({
              projects: [...state.projects, newProject]
            }))
            return newProject._id
          }
          throw new Error("Failed to create project")
        } catch (error) {
          console.error("Error in addProject:", error)
          throw error
        }
      },
      updateProject: async (id: string, newTitle: string, newDescription?: string) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }
        await updateProjectInDb({
          projectId: id,
          userEmail: userEmail,
          newTitle: newTitle,
          newDescription: newDescription || ""
        })
        set((state) => ({
          projects: state.projects.map((project) =>
            project._id === id ? { ...project, title: newTitle } : project
          )
        }))
      },
      removeProject: async (id: string) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }
        try {
          await deleteProjectInDb(id, userEmail)
          set((state) => ({
            projects: state.projects.filter((project) => project._id !== id)
          }))
        } catch (error) {
          console.error("Error removing project:", error)
          throw error
        }
      },
      updateProjectOrder: async (activeId: string, overId: string) => {
        const state = useTaskStore.getState()
        const userEmail = state.userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }

        const oldProjects = [...state.projects]
        const activeIndex = oldProjects.findIndex((p) => p._id === activeId)
        const overIndex = oldProjects.findIndex((p) => p._id === overId)

        if (activeIndex === -1 || overIndex === -1) {
          return
        }

        // Optimistic update
        const newProjects = arrayMove(oldProjects, activeIndex, overIndex)
        set({ projects: newProjects })

        try {
          const projectIds = newProjects.map((p) => p._id)
          const success = await updateProjectOrderInDb(projectIds, userEmail)
          if (!success) {
            // Revert on failure
            set({ projects: oldProjects })
            console.error("Failed to update project order")
          }
        } catch (error) {
          // Revert on error
          set({ projects: oldProjects })
          console.error("Error updating project order:", error)
          throw error
        }
      },
      addTask: async (
        projectId: string,
        title: string,
        status: "TODO" | "IN_PROGRESS" | "DONE",
        description?: string,
        dueDate?: Date,
        assigneeId?: string
      ) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }
        try {
          const newTask = await createTaskInDb(
            projectId,
            title,
            userEmail,
            description,
            dueDate,
            assigneeId,
            status
          )

          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === projectId
                ? { ...project, tasks: [...project.tasks, newTask] }
                : project
            )
          }))
        } catch (error) {
          console.error("Error in addTask:", error)
          throw error
        }
      },
      updateTask: async (
        taskId: string,
        title: string,
        status: "TODO" | "IN_PROGRESS" | "DONE",
        description?: string,
        dueDate?: Date,
        assigneeId?: string
      ) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }

        try {
          const updatedTask = await updateTaskInDb(
            taskId,
            title,
            userEmail,
            status,
            description,
            dueDate,
            assigneeId
          )

          if (!updatedTask) {
            throw new Error("Failed to update task")
          }

          set((state) => ({
            projects: state.projects.map((project) => ({
              ...project,
              tasks: project.tasks.map((task) =>
                task._id === taskId ? { ...task, ...updatedTask } : task
              )
            }))
          }))
        } catch (error) {
          console.error("Error updating task:", error)
          throw error
        }
      },
      removeTask: async (taskId: string) => {
        try {
          await deleteTaskInDb(taskId)

          set((state) => ({
            projects: state.projects.map((project) => ({
              ...project,
              tasks: project.tasks.filter((task) => task._id !== taskId)
            }))
          }))
        } catch (error) {
          console.error("Error in removeTask:", error)
          throw error
        }
      },
      dragTaskOnProject: async (taskId: string, overlayProjectId: string) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }
        try {
          const state = useTaskStore.getState()
          const task = state.projects.flatMap((p) => p.tasks).find((t) => t._id === taskId)

          if (!task) {
            console.error("Task not found")
            return
          }

          const oldProject = state.projects.find((p) => p._id === task.project)
          const targetProject = state.projects.find((p) => p._id === overlayProjectId)

          if (!oldProject || !targetProject) {
            console.error("Project not found", {
              oldProjectId: task.project,
              overlayProjectId
            })
            return
          }

          if (oldProject._id === targetProject._id) {
            const task = oldProject.tasks.find((t) => t._id === taskId)
            if (!task) {
              return
            }

            const updatedProject = {
              ...oldProject,
              tasks: [...oldProject.tasks.filter((t) => t._id !== taskId), task]
            }

            set((state) => ({
              projects: state.projects.map((project) =>
                project._id === oldProject._id ? updatedProject : project
              )
            }))
            return
          }

          const updatedTask = await updateTaskProjectInDb(userEmail, taskId, overlayProjectId)

          if (!updatedTask) {
            console.error("Failed to update task project")
            return
          }

          const updatedOldProject = {
            ...oldProject,
            tasks: oldProject.tasks.filter((task) => task._id !== taskId)
          }

          const updatedTargetProject = {
            ...targetProject,
            tasks: [...targetProject.tasks, updatedTask]
          }

          set((state) => ({
            projects: state.projects.map((project) => {
              if (project._id === oldProject._id) {
                return updatedOldProject
              }
              if (project._id === targetProject._id) {
                return updatedTargetProject
              }
              return project
            })
          }))
        } catch (error) {
          console.error("Error in dragTaskIntoNewProject:", error)
          throw error
        }
      },
      filter: {
        status: null,
        search: ""
      },
      setFilter: (filter) => {
        set((state) => ({
          filter: {
            ...state.filter,
            ...filter
          }
        }))
      },
      currentBoardId: null,
      setCurrentBoardId: (boardId: string) => {
        set({ currentBoardId: boardId })
      },
      addBoard: async (title: string, description?: string) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }
        try {
          const baseUrl = typeof window === "undefined" ? "http://localhost:3000" : ""
          const response = await fetch(`${baseUrl}/api/boards`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to create board")
          }

          const data = await response.json()
          const boardId = data.boardId
          set({
            currentBoardId: boardId,
            projects: []
          })
          return boardId
        } catch (error) {
          console.error("Error in addBoard:", error)
          throw error
        }
      },
      updateBoard: async (id: string, data: Partial<Board>) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }
        try {
          const updatedBoard = await updateBoardInDb(id, data, userEmail)
          if (!updatedBoard) {
            throw new Error("Failed to update board: No board was returned from the database")
          }
          // Don't return anything to match the State interface
        } catch (error) {
          console.error("Error in updateBoard:", error)
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
          throw new Error(`Failed to update board: ${errorMessage}`)
        }
      },
      removeBoard: async (id: string) => {
        const userEmail = useTaskStore.getState().userEmail
        if (!userEmail) {
          throw new Error("User email not found")
        }
        try {
          const success = await deleteBoardInDb(id, userEmail)
          if (!success) {
            throw new Error("Failed to delete board")
          }
        } catch (error) {
          console.error("Error in removeBoard:", error)
          throw error
        }
      },
      myBoards: [],
      teamBoards: [],
      setMyBoards: (boards: Board[]) =>
        set({
          myBoards: boards
        }),
      setTeamBoards: (boards: Board[]) => set({ teamBoards: boards }),
      resetInBoards: () => {
        set({
          myBoards: [],
          teamBoards: [],
          currentBoardId: null,
          projects: []
        })
      }
    }),
    {
      name: "task-store"
    }
  )
)
