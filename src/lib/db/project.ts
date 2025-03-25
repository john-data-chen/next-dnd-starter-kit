'use server';

import { ProjectModel, ProjectType } from '@/models/project.model';
import { TaskModel } from '@/models/task.model';
import { Task } from '@/types/dbInterface';
import { Types } from 'mongoose';
import { connectToDatabase } from './connect';
import { getUserByEmail, getUserById } from './user';

interface ProjectBase {
  _id: Types.ObjectId | string;
  title: string;
  owner: Types.ObjectId | string | { id: string; name: string };
  members: (Types.ObjectId | string | { id: string; name: string })[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  tasks?: Task[];
  board: string;
}

export async function getProjectsFromDb(
  boardId: string
): Promise<ProjectType[] | null> {
  try {
    await connectToDatabase();
    const boardObjectId = new Types.ObjectId(boardId);

    const projects = await ProjectModel.find({
      board: boardObjectId
    }).lean();

    if (!projects || projects.length === 0) {
      console.log('No projects found for board:', boardId);
      return [];
    }

    const plainProjects = await Promise.all(
      projects.map((project) =>
        convertProjectToPlainObject(project as ProjectBase)
      )
    );

    return plainProjects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

async function convertProjectToPlainObject(
  projectDoc: ProjectBase
): Promise<ProjectType> {
  // Handle the case where owner is already an object
  let ownerUser;
  if (
    typeof projectDoc.owner === 'object' &&
    'id' in projectDoc.owner &&
    'name' in projectDoc.owner
  ) {
    // Owner is already an object with id and name
    ownerUser = {
      id: projectDoc.owner.id,
      name: projectDoc.owner.name
    };
  } else {
    // Owner is an ObjectId or string
    const ownerId =
      typeof projectDoc.owner === 'string'
        ? projectDoc.owner
        : projectDoc.owner.toString();

    ownerUser = await getUserById(ownerId);
    if (!ownerUser) {
      throw new Error('Owner user not found');
    }
  }

  // Handle the case where members might be an array of objects
  const memberPromises = projectDoc.members.map(async (member) => {
    if (typeof member === 'object' && 'id' in member && 'name' in member) {
      // Member is already an object with id and name
      return {
        id: member.id,
        name: member.name
      };
    } else {
      // Member is an ObjectId or string
      const memberIdStr =
        typeof member === 'string' ? member : member.toString();

      const memberUser = await getUserById(memberIdStr);
      if (!memberUser) {
        return null;
      }
      return {
        id: memberUser.id.toString(),
        name: memberUser.name
      };
    }
  });

  const members = (await Promise.all(memberPromises)).filter(
    (member): member is { id: string; name: string } => member !== null
  );

  const docId =
    typeof projectDoc._id === 'string'
      ? projectDoc._id
      : projectDoc._id.toString();

  return {
    _id: docId,
    title: projectDoc.title,
    owner: {
      id: ownerUser.id,
      name: ownerUser.name
    },
    members: members,
    createdAt:
      typeof projectDoc.createdAt === 'string'
        ? projectDoc.createdAt
        : projectDoc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt:
      typeof projectDoc.updatedAt === 'string'
        ? projectDoc.updatedAt
        : projectDoc.updatedAt?.toISOString() || new Date().toISOString(),
    tasks: projectDoc.tasks || [],
    board: projectDoc.board
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
      owner: owner.id,
      members: [owner.id]
    });

    // Convert to plain object using toObject() and cast to ProjectBase type
    const project = convertProjectToPlainObject(
      projectDoc.toObject() as ProjectBase
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
    if (project.owner.toString() !== owner.id.toString()) {
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

    // Convert to plain object using toObject() and cast to ProjectBase type
    const updatedProject = convertProjectToPlainObject(
      updatedProjectDoc.toObject() as ProjectBase
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
    if (project.owner.toString() !== owner.id.toString()) {
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
