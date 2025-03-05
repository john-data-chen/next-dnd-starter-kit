import { ProjectModel } from '@/models/project.model';
import { TaskModel } from '@/models/task.model';
import { UserModel } from '@/models/user.model';
import mongoose from 'mongoose';

export interface Project {
  _id: string;
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  project: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  assigner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectModel = mongoose.InferSchemaType<
  (typeof ProjectModel)['schema']
> & {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  tasks: Task[];
};

export type UserModel = mongoose.InferSchemaType<
  (typeof UserModel)['schema']
> & {
  _id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
};

export type TaskModel = mongoose.InferSchemaType<
  (typeof TaskModel)['schema']
> & {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  project: string;
  assignee?: string;
  assigner: string;
};
