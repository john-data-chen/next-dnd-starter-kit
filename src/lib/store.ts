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
  projects: Project[];
  fetchProjects: (userId: string) => Promise<void>;
  setProjects: (projects: Project[]) => void;
  addProject: (title: string, userId: string) => void;
  updateProject: (id: string, newName: string, userId: string) => void;
  removeProject: (id: string, userId: string) => void;
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
      projects: [] as Project[],
      fetchProjects: async (userId: string) => {
        const projects = await getProjectsFromDb(userId);
        if (projects) {
          set({ projects });
        }
      },
      addProject: async (title: string, userId: string) => {
        const newProject = await createProjectInDb({
          name: title,
          owner: userId
        });
        if (newProject) {
          set((state) => ({
            projects: [...state.projects, newProject]
          }));
        }
      },
      updateProject: async (id: string, newName: string, userId: string) => {
        const updatedProject = await updateProjectInDb(id, userId, {
          name: newName
        });
        if (updatedProject) {
          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === id ? updatedProject : project
            )
          }));
        }
      },
      removeProject: async (id: string, userId: string) => {
        const deletedProject = await deleteProjectInDb(id, userId);
        if (deletedProject) {
          set((state) => ({
            projects: state.projects.filter((project) => project._id !== id)
          }));
        }
      },
      setProjects: (projects: Project[]) => {
        set({ projects });
      }
    }))
  )
);
