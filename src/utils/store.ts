import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { persist, devtools } from 'zustand/middleware';
import { Task, Project } from '@/types/tasks';

interface State {
  projects: Project[];
  addProject: (title: string) => void;
  updateProject: (id: string, newName: string) => void;
  removeProject: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  addTask: (projectId: string, title: string, description?: string) => void;
  updateTask: (taskId: string, title: string) => void;
  removeTask: (taskId: string) => void;
}

export const useTaskStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        projects: [] as Project[],
        addProject: (title: string) =>
          set((state) => ({
            projects: [
              ...state.projects,
              { title, id: uuid(), tasks: [] as Task[] }
            ]
          })),
        updateProject: (id: string, newName: string) =>
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id ? { ...project, title: newName } : project
            )
          })),
        removeProject: (id: string) =>
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id)
          })),
        setProjects: (projects: Project[]) => set({ projects }),
        addTask: (projectId: string, title: string, description?: string) =>
          set((state) => ({
            projects: state.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  tasks: [
                    ...project.tasks,
                    { projectId, id: uuid(), title, description }
                  ]
                };
              }
              return project;
            })
          })),
        updateTask: (taskId: string, title: string) =>
          set((state) => ({
            projects: state.projects.map((project) => ({
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, title } : task
              )
            }))
          })),
        removeTask: (taskId: string) =>
          set((state) => ({
            projects: state.projects.map((project) => ({
              ...project,
              tasks: project.tasks.filter((task) => task.id !== taskId)
            }))
          }))
      }),
      { name: 'tasks-store' }
    )
  )
);
