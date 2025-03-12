'use server';

import { ProjectModel } from '@/models/project.model';
import { TaskModel, TaskType } from '@/models/task.model';
import { Task } from '@/types/dbInterface';
import { Types } from 'mongoose';
import { connectToDatabase } from './connect';
import { getUserByEmail, getUserById } from './user';

interface TaskDocument {
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
  if (!taskDoc) {
    throw new Error('Task document is undefined');
  }

  if (!taskDoc.creator?.toString() || !taskDoc.lastModifier?.toString()) {
    throw new Error(
      `Task document missing required fields: creator (${taskDoc.creator}) or lastModifier (${taskDoc.lastModifier})`
    );
  }

  const [assigneeUser, creatorUser, modifierUser] = await Promise.all([
    taskDoc.assignee
      ? getUserById(taskDoc.assignee.toString())
      : Promise.resolve(null),
    getUserById(taskDoc.creator.toString()),
    getUserById(taskDoc.lastModifier.toString())
  ]);

  if (!creatorUser || !modifierUser) {
    throw new Error('Unable to find creator or modifier user data');
  }

  return {
    _id: taskDoc._id.toString(),
    title: taskDoc.title,
    description: taskDoc.description || '',
    dueDate: taskDoc.dueDate,
    project: taskDoc.project.toString(),
    assignee: assigneeUser
      ? {
          id: taskDoc.assignee!.toString(),
          name: assigneeUser.name
        }
      : undefined,
    creator: {
      id: taskDoc.creator.toString(),
      name: creatorUser.name
    },
    lastModifier: {
      id: taskDoc.lastModifier.toString(),
      name: modifierUser.name
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
      tasks.map((task) => {
        return convertTaskToPlainObject(
          task.toObject() as unknown as TaskDocument
        );
      })
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

async function ensureUserIsMember(
  projectId: string,
  userId: string
): Promise<void> {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const isMember = project.members.some(
    (member) => member.toString() === userId
  );

  if (!isMember) {
    await ProjectModel.findByIdAndUpdate(projectId, {
      $push: { members: userId }
    });
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

    if (assigneeId) {
      await ensureUserIsMember(projectId, assigneeId);
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
  userEmail: string,
  description?: string,
  dueDate?: Date,
  assigneeId?: string
): Promise<Task> {
  try {
    await connectToDatabase();
    const modifier = await getUserByEmail(userEmail);
    if (!modifier) {
      throw new Error('Modifier not found');
    }
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (assigneeId) {
      await ensureUserIsMember(task.project.toString(), assigneeId);
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

export async function updateTaskProjectInDb(
  userEmail: string,
  taskId: string,
  newProjectId: string
): Promise<Task> {
  try {
    await connectToDatabase();

    const user = await getUserByEmail(userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    const project = await ProjectModel.findById(newProjectId);
    if (project!.owner.toString() !== user._id) {
      console.error('Permission denied: User is not the project owner');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        project: new Types.ObjectId(newProjectId),
        lastModifier: user._id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedTask) {
      throw new Error('Failed to update task');
    }

    return convertTaskToPlainObject(updatedTask as unknown as TaskDocument);
  } catch (error) {
    console.error('Error updating task project:', error);
    throw error;
  }
}

export async function deleteTaskInDb(taskId: string): Promise<void> {
  try {
    await connectToDatabase();
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    await TaskModel.findByIdAndDelete(taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
