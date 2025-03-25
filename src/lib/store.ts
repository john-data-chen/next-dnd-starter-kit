import { Board, Project } from '@/types/dbInterface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createBoardInDb, deleteBoardInDb, updateBoardInDb } from './db/board';
import {
  createProjectInDb,
  deleteProjectInDb,
  getProjectsFromDb,
  updateProjectInDb
} from './db/project';
import {
  createTaskInDb,
  deleteTaskInDb,
  getTasksByProjectId,
  updateTaskInDb,
  updateTaskProjectInDb
} from './db/task';
import { getUserByEmail } from './db/user';

interface State {
  userEmail: string | null;
  userId: string | null;
  setUserInfo: (email: string) => void;
  projects: Project[];
  fetchProjects: (boardId: string) => Promise<void>;
  setProjects: (projects: Project[]) => void;
  addProject: (title: string, userEmail: string) => void;
  updateProject: (id: string, newTitle: string, userEmail: string) => void;
  removeProject: (id: string, userEmail: string) => void;
  addTask: (
    projectId: string,
    userEmail: string,
    title: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE',
    description?: string,
    dueDate?: Date,
    assigneeId?: string
  ) => Promise<void>;
  updateTask: (
    taskId: string,
    title: string,
    userEmail: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE',
    description?: string,
    dueDate?: Date,
    assigneeId?: string
  ) => void;
  removeTask: (taskId: string) => void;
  dragTaskIntoNewProject: (
    taskId: string,
    newProjectId: string,
    userEmail: string
  ) => Promise<void>;
  filter: {
    status: string | null;
    search: string;
  };
  setFilter: (filter: Partial<State['filter']>) => void;
  currentBoardId: string | null;
  setCurrentBoardId: (boardId: string) => void;
  addBoard: (
    title: string,
    userEmail: string,
    description?: string
  ) => Promise<void>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
}

export const useTaskStore = create<State>()(
  persist(
    (set) => ({
      userEmail: null,
      userId: null,
      projects: [] as Project[],
      setUserInfo: async (email: string) => {
        const user = await getUserByEmail(email);
        if (!user) {
          throw new Error('User not found');
        }
        set({ userEmail: email, userId: user.id });
      },
      fetchProjects: async (boardId: string) => {
        try {
          const projects = await getProjectsFromDb(boardId);
          if (!projects || projects.length === 0) {
            set({ projects: [] });
            return;
          }

          const projectsWithTasks = await Promise.all(
            projects.map(async (project) => {
              try {
                const tasks = await getTasksByProjectId(project._id);
                return {
                  ...project,
                  tasks: tasks || []
                };
              } catch (error) {
                console.error(
                  `Error fetching tasks for project ${project._id}:`,
                  error
                );
                return {
                  ...project,
                  tasks: []
                };
              }
            })
          );

          set({ projects: projectsWithTasks });
        } catch (error) {
          console.error('Error fetching projects:', error);
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
        status: 'TODO' | 'IN_PROGRESS' | 'DONE',
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
            assigneeId,
            status
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
        userEmail: string,
        status: 'TODO' | 'IN_PROGRESS' | 'DONE',
        description?: string,
        dueDate?: Date,
        assigneeId?: string
      ) => {
        try {
          const updatedTask = await updateTaskInDb(
            taskId,
            title,
            userEmail,
            status,
            description || '',
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
      removeTask: async (taskId: string) => {
        try {
          await deleteTaskInDb(taskId);

          set((state) => ({
            projects: state.projects.map((project) => ({
              ...project,
              tasks: project.tasks.filter((task) => task._id !== taskId)
            }))
          }));
        } catch (error) {
          console.error('Error in removeTask:', error);
          throw error;
        }
      },
      dragTaskIntoNewProject: async (
        userEmail: string,
        taskId: string,
        newProjectId: string
      ) => {
        try {
          const updatedTask = await updateTaskProjectInDb(
            userEmail,
            taskId,
            newProjectId
          );

          set((state) => {
            const oldProject = state.projects.find((project) =>
              project.tasks.some((task) => task._id === taskId)
            );

            if (!oldProject) {
              console.error('Task not found in any project');
              return state;
            }

            const targetProject = state.projects.find(
              (project) => project._id === newProjectId
            );

            if (!targetProject) {
              console.error('Target project not found');
              return state;
            }

            const updatedOldProject = {
              ...oldProject,
              tasks: oldProject.tasks.filter((task) => task._id !== taskId)
            };

            const updatedTargetProject = {
              ...targetProject,
              tasks: [...targetProject.tasks, updatedTask]
            };

            return {
              projects: state.projects.map((project) => {
                if (project._id === oldProject._id) return updatedOldProject;
                if (project._id === targetProject._id)
                  return updatedTargetProject;
                return project;
              })
            };
          });
        } catch (error) {
          console.error('Error in dragTaskIntoNewProject:', error);
          throw error;
        }
      },
      filter: {
        status: null,
        search: ''
      },
      setFilter: (filter) => {
        set((state) => ({
          filter: {
            ...state.filter,
            ...filter
          }
        }));
      },
      currentBoardId: null,
      setCurrentBoardId: (boardId: string) => {
        set({ currentBoardId: boardId });
      },
      addBoard: async (
        title: string,
        userEmail: string,
        description?: string
      ) => {
        try {
          const newBoard = await createBoardInDb({
            title,
            userEmail,
            description
          });
          if (!newBoard) {
            throw new Error('Failed to create board');
          }
        } catch (error) {
          console.error('Error in addBoard:', error);
          throw error;
        }
      },

      updateBoard: async (id: string, data: Partial<Board>) => {
        try {
          const updatedBoard = await updateBoardInDb(id, data);
          if (!updatedBoard) throw new Error('Failed to update board');
        } catch (error) {
          console.error('Error in updateBoard:', error);
          throw error;
        }
      },

      removeBoard: async (id: string) => {
        try {
          const success = await deleteBoardInDb(id);
          if (!success) throw new Error('Failed to delete board');
        } catch (error) {
          console.error('Error in removeBoard:', error);
          throw error;
        }
      }
    }),
    {
      name: 'task-store'
    }
  )
);
