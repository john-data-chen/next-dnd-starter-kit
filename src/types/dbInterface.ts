import { Project as ProjectModel } from '@/models/project.model';
import { Task as TaskModel } from '@/models/task.model';
import mongoose from 'mongoose';

export type Project = mongoose.InferSchemaType<
  (typeof ProjectModel)['schema']
> & {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  tasks: Task[];
};

export type Task = mongoose.InferSchemaType<(typeof TaskModel)['schema']> & {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  project: string;
  assignee?: string;
  assigner: string;
};
