import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { persist } from 'zustand/middleware';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Task, Column, State } from '@/types/tasks';

export type Actions = {
  addTask: (columnId: string, title: string, description?: string) => void;
  addCol: (title: string) => void;
  removeCol: (id: UniqueIdentifier) => void;
  setCols: (cols: Column[]) => void;
  updateCol: (id: UniqueIdentifier, newName: string) => void;
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
      updateCol: (id: UniqueIdentifier, newName: string) =>
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
      dragTask: (id: string | null) => set({ draggedTask: id }),
      removeCol: (id: UniqueIdentifier) =>
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id)
        })),
      setCols: (newCols: Column[]) => set({ columns: newCols })
    }),
    { name: 'task-store', skipHydration: true }
  )
);
