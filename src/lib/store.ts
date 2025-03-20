import { Board, Project } from '@/types/dbInterface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createBoardInDb,
  deleteBoardInDb,
  getBoardsFromDb,
  updateBoardInDb
} from './db/board';
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
  fetchProjects: (userEmail: string) => Promise<void>;
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
  boards: Board[];
  currentBoardId: string | null;
  fetchBoards: (userEmail: string) => Promise<void>;
  setCurrentBoard: (boardId: string) => void;
  addBoard: (title: string, userEmail: string) => Promise<void>;
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
      fetchProjects: async (userEmail: string) => {
        try {
          const currentProjects = useTaskStore.getState().projects;
          const projects = await getProjectsFromDb(userEmail);
          if (!projects || projects.length === 0) {
            set({ projects: [] });
            return;
          }

          let orderedProjects = [...projects];
          if (currentProjects.length > 0) {
            const projectMap = new Map(projects.map((p) => [p._id, p]));
            orderedProjects = currentProjects
              .filter((p) => projectMap.has(p._id))
              .map((p) => projectMap.get(p._id)!);
            const existingIds = new Set(orderedProjects.map((p) => p._id));
            const newProjects = projects.filter((p) => !existingIds.has(p._id));
            orderedProjects = [...orderedProjects, ...newProjects];
          }

          const projectsWithTasks = await Promise.all(
            orderedProjects.map(async (project) => {
              try {
                const currentStateTasks =
                  useTaskStore
                    .getState()
                    .projects.find((p) => p._id === project._id)?.tasks || [];

                const dbTasks = await getTasksByProjectId(project._id);

                if (
                  currentStateTasks.length > 0 &&
                  currentStateTasks.length === dbTasks?.length
                ) {
                  return {
                    ...project,
                    tasks: currentStateTasks
                  };
                }

                return {
                  ...project,
                  tasks: dbTasks || []
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
      // Add filter state and setter
      filter: {
        status: null,
        search: '' // 初始化搜索字段
      },
      setFilter: (filter) => {
        set((state) => ({
          filter: {
            ...state.filter,
            ...filter
          }
        }));
      },
      boards: [],
      currentBoardId: null,

      fetchBoards: async (userEmail: string) => {
        try {
          const boards = await getBoardsFromDb(userEmail);
          set({ boards: boards || [] });
        } catch (error) {
          console.error('Error fetching boards:', error);
          set({ boards: [] });
        }
      },

      setCurrentBoard: (boardId: string) => {
        set({ currentBoardId: boardId });
      },

      addBoard: async (title: string, userEmail: string) => {
        try {
          const newBoard = await createBoardInDb({ title, userEmail });
          if (newBoard) {
            set((state) => ({
              boards: [...state.boards, newBoard],
              currentBoardId: newBoard._id
            }));
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

          set((state) => ({
            boards: state.boards.map((board) =>
              board._id === id ? updatedBoard : board
            )
          }));
        } catch (error) {
          console.error('Error in updateBoard:', error);
          throw error;
        }
      },

      removeBoard: async (id: string) => {
        try {
          const success = await deleteBoardInDb(id);
          if (!success) throw new Error('Failed to delete board');

          set((state) => ({
            boards: state.boards.filter((board) => board._id !== id),
            currentBoardId:
              state.currentBoardId === id ? null : state.currentBoardId,
            projects: state.currentBoardId === id ? [] : state.projects
          }));
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
