export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Task = {
  id: string;
  title: string;
  description?: string;
};

export type State = {
  columns: Column[];
  draggedTask: string | null;
};
