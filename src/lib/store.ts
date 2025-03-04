import { Project } from '@/types/dbInterface';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb
} from './db/project';

interface State {
  userEmail: string | null;
  setUserEmail: (userEmail: string) => void;
  projects: Project[];
  fetchProjects: (userEmail: string) => Promise<void>;
  setProjects: (projects: Project[]) => void;
  addProject: (title: string, userEmail: string) => void;
  updateProject: (id: string, newName: string, userEmail: string) => void;
  removeProject: (id: string, userEmail: string) => void;
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
    persist((set) => ({
      userEmail: null,
      setUserEmail: (userEmail: string) => set({ userEmail }),
      projects: [] as Project[],
      fetchProjects: async (userEmail: string) => {
        const projects = await getProjectsFromDb(userEmail);
        if (projects) {
          set({ projects });
        }
      },
      addProject: async (title: string, userEmail: string) => {
        const newProject = await createProjectInDb({
          title: title,
          owner: userEmail
        });
        if (newProject) {
          set((state) => ({
            projects: [...state.projects, newProject]
          }));
        }
      },
      updateProject: async (
        id: string,
        newTitle: string,
        userEmail: string
      ) => {
        const updatedProject = await updateProjectInDb(id, userEmail, {
          title: newTitle
        });
        if (updatedProject) {
          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === id ? updatedProject : project
            )
          }));
        }
      },
      removeProject: async (id: string, userEmail: string) => {
        const deletedProject = await deleteProjectInDb(id, userEmail);
        if (deletedProject) {
          set((state) => ({
            projects: state.projects.filter((project) => project._id !== id)
          }));
        }
      },
      setProjects: (projects: Project[]) => {
        set({ projects });
      }
    })),
    {
      name: 'task-storage'
    }
  )
);
