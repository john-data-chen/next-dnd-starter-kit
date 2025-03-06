import { Project } from '@/types/dbInterface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb
} from './db/project';
import { getTasksByProjectId } from './db/task';

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
  persist(
    (set) => ({
      userEmail: null,
      setUserEmail: (userEmail: string) => set({ userEmail }),
      projects: [] as Project[],
      fetchProjects: async (userEmail: string) => {
        const projects = await getProjectsFromDb(userEmail);
        if (projects) {
          const projectsWithTasks = await Promise.all(
            projects.map(async (project) => {
              const tasks = await getTasksByProjectId(project._id);
              return {
                ...project,
                tasks: tasks || []
              };
            })
          );
          set({ projects: projectsWithTasks });
        } else {
          set({ projects: [] });
        }
      },
      setProjects: (projects: Project[]) => set({ projects }),
      addProject: async (title: string, userEmail: string) => {
        try {
          const newProject = await createProjectInDb({ title, userEmail });
          if (newProject) {
            set((state) => ({
              projects: [...state.projects, newProject]
            }));
          } else {
            console.error('Failed to create project');
          }
        } catch (error) {
          console.error('Error in addProject:', error);
        }
      },
      updateProject: (id: string, newTitle: string, userEmail: string) => {
        updateProjectInDb({
          projectId: id,
          userEmail: userEmail,
          newTitle: newTitle
        });
        set((state) => ({
          projects: state.projects.map((project) =>
            project._id === id ? { ...project, title: newTitle } : project
          )
        }));
      },
      removeProject: (id: string, userEmail: string) => {
        deleteProjectInDb(id, userEmail);
      },
      addTask: () => {
        // implement addTask logic
      },
      updateTask: () => {
        // implement updateTask logic
      },
      removeTask: () => {
        // implement removeTask logic
      }
    }),
    {
      name: 'task-store'
    }
  )
);
