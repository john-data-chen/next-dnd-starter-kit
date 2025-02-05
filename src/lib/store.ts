import { Project, Task } from '@/types/tasks';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface State {
  projects: Project[];
  addProject: (title: string) => void;
  updateProject: (id: string, newName: string) => void;
  removeProject: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  addTask: (
    projectId: string,
    title: string,
    description: string,
    dueDate: Date | null
  ) => void;
  updateTask: (
    taskId: string,
    title: string,
    description?: string,
    dueDate?: Date
  ) => void;
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
        addTask: (
          projectId: string,
          title: string,
          description: string,
          dueDate: Date | null
        ) =>
          set((state) => ({
            projects: state.projects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  tasks: [
                    ...project.tasks,
                    { projectId, id: uuid(), title, description, dueDate }
                  ]
                };
              }
              return project;
            })
          })),
        updateTask: (
          taskId: string,
          title: string,
          description?: string,
          dueDate?: Date | null
        ) =>
          set((state) => ({
            projects: state.projects.map((project) => ({
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, title, description, dueDate }
                  : task
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
