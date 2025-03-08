import { Project } from '@/types/dbInterface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb
} from './db/project';
import { createTaskInDb, getTasksByProjectId, updateTaskInDb } from './db/task';

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
    userEmail: string,
    title: string,
    description?: string,
    dueDate?: Date,
    assigneeId?: string
  ) => Promise<void>;
  updateTask: (
    taskId: string,
    title: string,
    description?: string,
    dueDate?: Date,
    assigneeId?: string
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
      removeProject: async (id: string, userEmail: string) => {
        await deleteProjectInDb(id, userEmail);
        set((state) => ({
          projects: state.projects.filter((project) => project._id !== id)
        }));
      },
      addTask: async (
        projectId: string,
        userEmail: string,
        title: string,
        description?: string,
        dueDate?: Date,
        assigneeId?: string
      ) => {
        try {
          const newTask = await createTaskInDb(
            projectId,
            title,
            userEmail,
            description,
            dueDate,
            assigneeId
          );

          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === projectId
                ? { ...project, tasks: [...project.tasks, newTask] }
                : project
            )
          }));
        } catch (error) {
          console.error('Error in addTask:', error);
          throw error;
        }
      },
      updateTask: async (
        taskId: string,
        title: string,
        description?: string,
        dueDate?: Date,
        assigneeId?: string
      ) => {
        try {
          const updatedTask = await updateTaskInDb(
            taskId,
            title,
            description,
            dueDate,
            assigneeId
          );

          set((state) => ({
            projects: state.projects.map((project) => ({
              ...project,
              tasks: project.tasks.map((task) =>
                task._id === taskId ? updatedTask : task
              )
            }))
          }));
        } catch (error) {
          console.error('Error in updateTask:', error);
          throw error;
        }
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
