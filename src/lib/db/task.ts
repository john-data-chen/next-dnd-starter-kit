'use server';

import { TaskModel, TaskType } from '@/models/task.model';
import { Task } from '@/types/dbInterface';
import { Document, Types } from 'mongoose';
import { connectToDatabase } from './connect';
import { getUserFromDb } from './user';

interface TaskDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  project: Types.ObjectId;
  assignee?: Types.ObjectId;
  assigner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

function convertTaskToPlainObject(taskDoc: TaskDocument): TaskType {
  return {
    _id: taskDoc._id.toString(),
    title: taskDoc.title,
    description: taskDoc.description,
    dueDate: taskDoc.dueDate,
    project: taskDoc.project.toString(),
    assignee: taskDoc.assignee?.toString(),
    assigner: taskDoc.assigner.toString(),
    createdAt: taskDoc.createdAt,
    updatedAt: taskDoc.updatedAt
  };
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  try {
    await connectToDatabase();
    const tasks = await TaskModel.find({ project: projectId });
    return tasks.map((task) =>
      convertTaskToPlainObject(task as unknown as TaskDocument)
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

export async function createTaskInDb(
  projectId: string,
  title: string,
  userEmail: string,
  description?: string,
  dueDate?: Date,
  assigneeId?: string
): Promise<Task> {
  try {
    await connectToDatabase();
    const assigner = await getUserFromDb(userEmail);
    if (!assigner) {
      throw new Error('Assigner not found');
    }

    const taskData = {
      title,
      description,
      dueDate,
      project: projectId,
      assignee: assigneeId,
      assigner: assigner._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newTask = await TaskModel.create(taskData);
    return convertTaskToPlainObject(newTask as unknown as TaskDocument);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}
