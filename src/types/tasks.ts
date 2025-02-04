export type Project = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Task = {
  projectId: string;
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
};
