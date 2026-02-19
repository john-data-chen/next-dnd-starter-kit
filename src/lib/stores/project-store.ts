import { arrayMove } from "@dnd-kit/sortable"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb,
  updateProjectOrderInDb
} from "@/lib/db/project"
import {
  createTaskInDb,
  deleteTaskInDb,
  getTasksByProjectId,
  updateTaskInDb,
  updateTaskProjectInDb
} from "@/lib/db/task"
import { Project } from "@/types/dbInterface"

import { useAuthStore } from "./auth-store"
import { useBoardStore } from "./board-store"

interface FilterState {
  status: string | null
  search: string
}

interface ProjectState {
  projects: Project[]
  isLoadingProjects: boolean
  filter: FilterState
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
  setFilter: (filter: Partial<FilterState>) => void
}

function requireEmail(): string {
  const email = useAuthStore.getState().userEmail
  if (!email) {
    throw new Error("User email not found")
  }
  return email
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoadingProjects: false,
      filter: { status: null, search: "" },

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
                return { ...project, tasks: tasks || [] }
              } catch (error) {
                console.error(`Error fetching tasks for project ${project._id}:`, error)
                return { ...project, tasks: [] }
              }
            })
          )
          set({ projects: projectsWithTasks })
        } catch (error) {
          console.error("Error fetching projects:", error)
          set({ projects: [] })
        } finally {
          set({ isLoadingProjects: false })
        }
      },

      setProjects: (projects: Project[]) => set({ projects }),

      addProject: async (title: string, description: string) => {
        const userEmail = requireEmail()
        const currentBoardId = useBoardStore.getState().currentBoardId
        if (!currentBoardId) {
          throw new Error("Board id not found")
        }

        const newProject = await createProjectInDb({
          title,
          description,
          userEmail,
          board: currentBoardId
        })
        if (!newProject) {
          throw new Error("Failed to create project")
        }

        set((state) => ({ projects: [...state.projects, newProject] }))
        return newProject._id
      },

      updateProject: async (id: string, newTitle: string, newDescription?: string) => {
        const userEmail = requireEmail()
        await updateProjectInDb({
          projectId: id,
          userEmail,
          newTitle,
          newDescription: newDescription || ""
        })
        set((state) => ({
          projects: state.projects.map((project) =>
            project._id === id ? { ...project, title: newTitle } : project
          )
        }))
      },

      removeProject: async (id: string) => {
        const userEmail = requireEmail()
        await deleteProjectInDb(id, userEmail)
        set((state) => ({
          projects: state.projects.filter((project) => project._id !== id)
        }))
      },

      updateProjectOrder: async (activeId: string, overId: string) => {
        const userEmail = requireEmail()
        const { projects } = get()
        const oldProjects = [...projects]
        const activeIndex = oldProjects.findIndex((p) => p._id === activeId)
        const overIndex = oldProjects.findIndex((p) => p._id === overId)
        if (activeIndex === -1 || overIndex === -1) {
          return
        }

        const newProjects = arrayMove(oldProjects, activeIndex, overIndex)
        set({ projects: newProjects })

        try {
          const projectIds = newProjects.map((p) => p._id)
          const success = await updateProjectOrderInDb(projectIds, userEmail)
          if (!success) {
            set({ projects: oldProjects })
            console.error("Failed to update project order")
          }
        } catch (error) {
          set({ projects: oldProjects })
          console.error("Error updating project order:", error)
          throw error
        }
      },

      addTask: async (projectId, title, status, description, dueDate, assigneeId) => {
        const userEmail = requireEmail()
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
            project._id === projectId ? { ...project, tasks: [...project.tasks, newTask] } : project
          )
        }))
      },

      updateTask: async (taskId, title, status, description, dueDate, assigneeId) => {
        const userEmail = requireEmail()
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
      },

      removeTask: async (taskId: string) => {
        await deleteTaskInDb(taskId)
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            tasks: project.tasks.filter((task) => task._id !== taskId)
          }))
        }))
      },

      dragTaskOnProject: async (taskId: string, overlayProjectId: string) => {
        const userEmail = requireEmail()
        const { projects } = get()
        const task = projects.flatMap((p) => p.tasks).find((t) => t._id === taskId)
        if (!task) {
          console.error("Task not found")
          return
        }

        const oldProject = projects.find((p) => p._id === task.project)
        const targetProject = projects.find((p) => p._id === overlayProjectId)
        if (!oldProject || !targetProject) {
          console.error("Project not found", { oldProjectId: task.project, overlayProjectId })
          return
        }

        if (oldProject._id === targetProject._id) {
          const movedTask = oldProject.tasks.find((t) => t._id === taskId)
          if (!movedTask) {
            return
          }
          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === oldProject._id
                ? {
                    ...project,
                    tasks: [...project.tasks.filter((t) => t._id !== taskId), movedTask]
                  }
                : project
            )
          }))
          return
        }

        const updatedTask = await updateTaskProjectInDb(userEmail, taskId, overlayProjectId)
        if (!updatedTask) {
          console.error("Failed to update task project")
          return
        }

        set((state) => ({
          projects: state.projects.map((project) => {
            if (project._id === oldProject._id) {
              return { ...project, tasks: project.tasks.filter((t) => t._id !== taskId) }
            }
            if (project._id === targetProject._id) {
              return { ...project, tasks: [...project.tasks, updatedTask] }
            }
            return project
          })
        }))
      },

      setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } }))
    }),
    { name: "project-store" }
  )
)
