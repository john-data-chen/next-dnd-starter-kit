import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { persist } from 'zustand/middleware';
import { Task, Column, State } from '@/types/tasks';

export type Actions = {
  addTask: (columnId: string, title: string, description?: string) => void;
  dragTask: (
    oldColumnId: string,
    newColumnId: string,
    draggedTask: Task
  ) => void;
  addCol: (title: string) => void;
  removeCol: (id: string) => void;
  setCols: (cols: Column[]) => void;
  updateCol: (id: string, newName: string) => void;
};

export const useTaskStore = create<State & Actions>()(
  persist(
    (set) => ({
      columns: [] as Column[],
      draggedTask: null,
      addTask: (columnId: string, title: string, description?: string) =>
        set((state) => ({
          columns: state.columns.map((col) => {
            if (col.id === columnId) {
              return {
                ...col,
                tasks: [...col.tasks, { id: uuid(), title, description }]
              };
            }
            return col;
          })
        })),
      dragTask: (oldColumnId: string, newColumnId: string, draggedTask: Task) =>
        set((state) => ({
          columns: state.columns.map((col) => {
            if (col.id === oldColumnId) {
              return {
                ...col,
                tasks: col.tasks.filter((task) => task.id !== draggedTask.id)
              };
            }
            if (col.id === newColumnId) {
              return {
                ...col,
                tasks: [...col.tasks, { ...draggedTask }]
              };
            }
            return col;
          })
        })),
      updateCol: (id: string, newName: string) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, title: newName } : col
          )
        })),
      addCol: (title: string) =>
        set((state) => ({
          columns: [
            ...state.columns,
            { title, id: uuid(), tasks: [] as Task[] }
          ]
        })),
      removeCol: (id: string) =>
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id)
        })),
      setCols: (newCols: Column[]) => set({ columns: newCols })
    }),
    { name: 'task-store', skipHydration: true }
  )
);
