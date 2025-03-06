'use server';

import { ProjectModel, ProjectType } from '@/models/project.model';
import { UserModel } from '@/models/user.model';
import { connectToDatabase } from './connect';
import { getUserFromDb } from './user';

export async function getProjectsFromDb(
  userEmail: string
): Promise<ProjectType[] | null> {
  try {
    await connectToDatabase();
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
  }
}

export async function createProjectInDb(data: {
  title: string;
  userEmail: string;
}): Promise<ProjectType | null> {
  try {
    await connectToDatabase();
    const owner = await UserModel.findOne({ email: data.userEmail });

    if (!owner) {
      console.error('Owner not found');
      return null;
    }
    const ownerId = owner._id.toString();
    const projectDoc = await ProjectModel.create({
      ...data,
      owner: ownerId,
      members: [ownerId]
    });

    const project = {
      _id: projectDoc._id.toString(),
      title: projectDoc.title,
      owner: projectDoc.owner.toString(),
      members: projectDoc.members.map((member) => member.toString()),
      createdAt: projectDoc.createdAt,
      updatedAt: projectDoc.updatedAt,
      tasks: []
    };

    console.log('Created project: ', project);
    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
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
  }
}
