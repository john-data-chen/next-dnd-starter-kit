'use server';

import { TaskModel } from '@/models/task.model';
import { TaskType } from '@/models/task.model';
import { connectToDatabase } from './connect';

export async function getTasksByProjectId(
  projectId: string
): Promise<TaskType[] | null> {
  try {
    await connectToDatabase();
    const tasks = await TaskModel.find({ project: projectId });
    return tasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
}
