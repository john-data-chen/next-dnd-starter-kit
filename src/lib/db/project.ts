'use server';

import { ProjectModel, ProjectType } from '@/models/project.model';
import { TaskModel } from '@/models/task.model';
import { Task } from '@/types/dbInterface';
import { Document, Types } from 'mongoose';
import { connectToDatabase } from './connect';
import { getUserByEmail, getUserById } from './user';

export async function getProjectsFromDb(
  userEmail: string
): Promise<ProjectType[] | null> {
  try {
    await connectToDatabase();
    const user = await getUserByEmail(userEmail);
    if (!user) {
      console.error('User not found');
      return null;
    }
    const projects = await ProjectModel.find({
      $or: [{ owner: user }, { members: user }]
    });
    const plainProjects = await Promise.all(
      projects.map((project) =>
        convertProjectToPlainObject(project as unknown as ProjectDocument)
      )
    );
    return plainProjects;
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

async function convertProjectToPlainObject(
  projectDoc: ProjectDocument
): Promise<ProjectType> {
  const ownerUser = await getUserById(projectDoc.owner.toString());
  if (!ownerUser) {
    throw new Error('Owner user not found');
  }

  const memberPromises = projectDoc.members.map(async (memberId) => {
    const memberUser = await getUserById(memberId.toString());
    if (!memberUser) {
      return null;
    }
    return {
      id: memberUser._id.toString(),
      name: memberUser.name
    };
  });

  const members = (await Promise.all(memberPromises)).filter(
    (member) => member !== null
  );

  return {
    _id: projectDoc._id.toString(),
    title: projectDoc.title,
    owner: {
      id: ownerUser._id.toString(),
      name: ownerUser.name
    },
    members: members,
    createdAt: projectDoc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: projectDoc.updatedAt?.toISOString() || new Date().toISOString(),
    tasks: projectDoc.tasks || []
  };
}

export async function createProjectInDb(data: {
  title: string;
  userEmail: string;
}): Promise<ProjectType | null> {
  try {
    await connectToDatabase();
    const owner = await getUserByEmail(data.userEmail);
    if (!owner) {
      console.error('User not found');
      return null;
    }
    const projectDoc = await ProjectModel.create({
      ...data,
      owner: owner._id,
      members: [owner._id]
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
    const owner = await getUserByEmail(data.userEmail);
    if (!owner) {
      console.error('Owner not found');
      return null;
    }
    if (project.owner.toString() !== owner._id.toString()) {
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
    const owner = await getUserByEmail(userEmail);
    if (!owner) {
      console.error('User not found');
      return false;
    }
    if (project.owner.toString() !== owner._id.toString()) {
      console.error('Permission denied: User is not the project owner');
      return false;
    }

    await TaskModel.deleteMany({ project: id });
    const deletedProject = await ProjectModel.findByIdAndDelete(id);
    return deletedProject !== null;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}
