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
                _id: project._id,
                owner: project.owner,
                members: project.members,
                tasks: tasks
                  ? tasks.map((task) => ({
                      ...task,
                      _id: task._id,
                      project: task.project,
                      assignee: task.assignee,
                      assigner: task.assigner
                    }))
                  : []
              } as Project;
            })
          );
          set({ projects: projectsWithTasks });
        } else {
          set({ projects: [] });
        }
      },
      setProjects: (projects: Project[]) => set({ projects }),
      addProject: (title: string, userEmail: string) => {
        createProjectInDb({ title, userEmail });
      },
      updateProject: (id: string, newName: string, userEmail: string) => {
        updateProjectInDb(id, userEmail, { title: newName });
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
