'use server';

import { TaskModel, TaskType } from '@/models/task.model';
import { Task } from '@/types/dbInterface';
import { Document, Types } from 'mongoose';
import { connectToDatabase } from './connect';
import { getUserByEmail, getUserById } from './user';

interface TaskDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  project: Types.ObjectId;
  assignee?: Types.ObjectId;
  creator: Types.ObjectId;
  lastModifier: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

async function convertTaskToPlainObject(
  taskDoc: TaskDocument
): Promise<TaskType> {
  const [assigneeUser, creatorUser, modifierUser] = await Promise.all([
    taskDoc.assignee ? getUserById(taskDoc.assignee.toString()) : null,
    getUserById(taskDoc.creator.toString()),
    getUserById(taskDoc.lastModifier.toString())
  ]);

  return {
    _id: taskDoc._id.toString(),
    title: taskDoc.title,
    description: taskDoc.description,
    dueDate: taskDoc.dueDate,
    project: taskDoc.project.toString(),
    assignee: taskDoc.assignee
      ? {
          id: taskDoc.assignee.toString(),
          name: assigneeUser?.name || 'Unknown User'
        }
      : undefined,
    creator: {
      id: taskDoc.creator.toString(),
      name: creatorUser?.name || 'Unknown User'
    },
    lastModifier: {
      id: taskDoc.lastModifier.toString(),
      name: modifierUser?.name || 'Unknown User'
    },
    createdAt: taskDoc.createdAt,
    updatedAt: taskDoc.updatedAt
  };
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  try {
    await connectToDatabase();
    const tasks = await TaskModel.find({ project: projectId });
    return Promise.all(
      tasks.map((task) =>
        convertTaskToPlainObject(task as unknown as TaskDocument)
      )
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
    const creator = await getUserByEmail(userEmail);
    if (!creator) {
      throw new Error('Creator not found');
    }

    const taskData = {
      title,
      description,
      dueDate,
      project: projectId,
      assignee: assigneeId,
      creator: creator._id,
      lastModifier: creator._id,
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

export async function updateTaskInDb(
  taskId: string,
  title: string,
  modifierEmail: string,
  description?: string,
  dueDate?: Date,
  assigneeId?: string
): Promise<Task> {
  try {
    await connectToDatabase();
    const modifier = await getUserByEmail(modifierEmail);
    if (!modifier) {
      throw new Error('Modifier not found');
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        dueDate,
        assignee: assigneeId,
        lastModifier: modifier._id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedTask) {
      throw new Error('Task not found');
    }

    return convertTaskToPlainObject(updatedTask as unknown as TaskDocument);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}
