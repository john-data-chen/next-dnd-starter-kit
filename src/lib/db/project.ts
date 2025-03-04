'use server';

import { ProjectModel, ProjectType } from '@/models/project.model';
import { connectToDatabase, disconnectFromDatabase } from './connect';
import { getUserFromDb } from './user';

export async function getProjectsFromDb(
  userEmail: string
): Promise<ProjectType[] | null> {
  try {
    await connectToDatabase();
    console.log('userEmail: ', userEmail);
    const user = await getUserFromDb(userEmail);
    if (!user) {
      console.error('User not found');
      return null;
    }
    const userId = user._id.toString();
    const projects = await ProjectModel.find({
      $or: [{ owner: userId }, { members: userId }]
    });
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  } finally {
    await disconnectFromDatabase();
  }
}

export async function createProjectInDb(data: {
  title: string;
  userEmail: string;
}): Promise<ProjectType | null> {
  try {
    await connectToDatabase();
    const owner = await ProjectModel.findOne({ email: data.userEmail });
    if (!owner) {
      console.error('Owner not found');
      return null;
    }
    const ownerId = owner._id.toString();
    const project = await ProjectModel.create({
      ...data,
      members: [ownerId]
    });
    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  } finally {
    await disconnectFromDatabase();
  }
}

export async function updateProjectInDb(
  id: string,
  userEmail: string,
  data: { title: string }
): Promise<ProjectType | null> {
  try {
    await connectToDatabase();

    const project = await ProjectModel.findById(id);

    if (!project) {
      console.error('Project not found');
      return null;
    }
    const user = await ProjectModel.findOne({ email: userEmail });
    if (!user) {
      console.error('User not found');
      return null;
    }
    const userId = user._id.toString();
    if (project.owner.toString() !== userId) {
      console.error('Permission denied: User is not the project owner');
      return null;
    }

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  } finally {
    await disconnectFromDatabase();
  }
}

export async function deleteProjectInDb(
  id: string,
  userEmail: string
): Promise<boolean> {
  try {
    await connectToDatabase();

    const project = await ProjectModel.findById(id);

    if (!project) {
      console.error('Project not found');
      return false;
    }
    const user = await ProjectModel.findOne({ email: userEmail });
    if (!user) {
      console.error('User not found');
      return false;
    }
    const userId = user._id.toString();
    if (project.owner.toString() !== userId) {
      console.error('Permission denied: User is not the project owner');
      return false;
    }

    await ProjectModel.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  } finally {
    await disconnectFromDatabase();
  }
}
