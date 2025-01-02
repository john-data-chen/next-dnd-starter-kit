export type Column = {
  id: string;
  title: string;
};

export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
};

export type State = {
  tasks: Task[];
  columns: Column[];
  draggedTask: string | null;
};
