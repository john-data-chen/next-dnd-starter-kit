'use server';

import { ProjectModel } from '@/models/project.model';
import { TaskType } from '@/models/task.model';
import { connectToDatabase } from './connect';

export async function getTasksByProjectId(
  projectId: string
): Promise<TaskType[] | null> {
  try {
    await connectToDatabase();
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      console.error('Project not found');
      return null;
    }
    console.log('project.tasks', project.tasks);
    return project.tasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
}
