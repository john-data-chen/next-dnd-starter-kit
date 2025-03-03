import { ProjectModel, ProjectType } from '@/models/project.model';
import { connectToDatabase, disconnectFromDatabase } from './connect';

export async function getProjectsFromDb(
  userId: string
): Promise<ProjectType[] | null> {
  try {
    await connectToDatabase();
    console.log('userId', userId);
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
  owner: string;
}): Promise<ProjectType | null> {
  try {
    await connectToDatabase();
    const project = await ProjectModel.create({
      ...data,
      members: [data.owner]
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
  userId: string,
  data: { title: string }
): Promise<ProjectType | null> {
  try {
    await connectToDatabase();

    const project = await ProjectModel.findById(id);

    if (!project) {
      console.error('Project not found');
      return null;
    }

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
  userId: string
): Promise<boolean> {
  try {
    await connectToDatabase();

    const project = await ProjectModel.findById(id);

    if (!project) {
      console.error('Project not found');
      return false;
    }

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
