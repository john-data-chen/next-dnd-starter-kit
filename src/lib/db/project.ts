'use server';

import { ProjectModel, ProjectType } from '@/models/project.model';
import { UserModel } from '@/models/user.model';
import { Task } from '@/types/dbInterface';
import { Document, Types } from 'mongoose';
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

interface ProjectDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  tasks?: Task[];
}

function convertProjectToPlainObject(projectDoc: ProjectDocument): ProjectType {
  return {
    _id: projectDoc._id.toString(),
    title: projectDoc.title,
    owner: projectDoc.owner.toString(),
    members: projectDoc.members.map((member) => member.toString()),
    createdAt: projectDoc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: projectDoc.updatedAt?.toISOString() || new Date().toISOString(),
    tasks: projectDoc.tasks || []
  };
}

async function getUserIdByEmail(userEmail: string): Promise<string | null> {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ userEmail });
    if (!user) {
      console.error('User not found');
      return null;
    }
    return user._id.toString();
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return null; // Add explicit return for error case
  }
}

export async function createProjectInDb(data: {
  title: string;
  userEmail: string;
}): Promise<ProjectType | null> {
  try {
    await connectToDatabase();
    const ownerId = await getUserIdByEmail(data.userEmail);
    const projectDoc = await ProjectModel.create({
      ...data,
      owner: ownerId,
      members: [ownerId]
    });

    const project = convertProjectToPlainObject(
      projectDoc as unknown as ProjectDocument
    );
    console.log('Created project: ', project);
    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function updateProjectInDb(data: {
  projectId: string;
  userEmail: string;
  newTitle: string;
}): Promise<ProjectType | null> {
  try {
    await connectToDatabase();
    const project = await ProjectModel.findById(data.projectId);
    if (!project) {
      console.error('Project not found');
      return null;
    }
    const userId = await getUserIdByEmail(data.userEmail);
    if (project.owner.toString() !== userId) {
      console.error('Permission denied: User is not the project owner');
      return null;
    }

    const updatedProjectDoc = await ProjectModel.findByIdAndUpdate(
      project._id,
      { ...data, title: data.newTitle, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedProjectDoc) {
      return null;
    }

    const updatedProject = convertProjectToPlainObject(
      updatedProjectDoc as unknown as ProjectDocument
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
