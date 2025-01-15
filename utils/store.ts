import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { persist, devtools } from 'zustand/middleware';
import { Task, Column } from '@/types/tasks';

interface State {
  columns: Column[];
  addCol: (title: string) => void;
  updateCol: (id: string, newName: string) => void;
  removeCol: (id: string) => void;
  setCols: (cols: Column[]) => void;
  addTask: (columnId: string, title: string, description?: string) => void;
  updateTask: (taskId: string, title: string) => void;
  removeTask: (taskId: string) => void;
}

export const useTaskStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        columns: [] as Column[],
        addCol: (title: string) =>
          set((state) => ({
            columns: [
              ...state.columns,
              { title, id: uuid(), tasks: [] as Task[] }
            ]
          })),
        updateCol: (id: string, newName: string) =>
          set((state) => ({
            columns: state.columns.map((col) =>
              col.id === id ? { ...col, title: newName } : col
            )
          })),
        removeCol: (id: string) =>
          set((state) => ({
            columns: state.columns.filter((col) => col.id !== id)
          })),
        setCols: (newCols: Column[]) => set({ columns: newCols }),
        addTask: (columnId: string, title: string, description?: string) =>
          set((state) => ({
            columns: state.columns.map((col) => {
              if (col.id === columnId) {
                return {
                  ...col,
                  tasks: [
                    ...col.tasks,
                    { columnId, id: uuid(), title, description }
                  ]
                };
              }
              return col;
            })
          })),
        updateTask: (taskId: string, title: string) =>
          set((state) => ({
            columns: state.columns.map((col) => ({
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === taskId ? { ...task, title } : task
              )
            }))
          })),
        removeTask: (taskId: string) =>
          set((state) => ({
            columns: state.columns.map((col) => ({
              ...col,
              tasks: col.tasks.filter((task) => task.id !== taskId)
            }))
          }))
      }),
      { name: 'tasks-store' }
    )
  )
);
