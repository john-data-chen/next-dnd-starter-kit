import { Project } from '@/models/project.model';
import { connectToDatabase, disconnectFromDatabase } from './connect';

export async function getProjectsFromDb() {
  try {
    await connectToDatabase();
    const projects = await Project.find();
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  } finally {
    await disconnectFromDatabase();
  }
}

export async function createProjectInDb(data: { name: string; owner: string }) {
  try {
    await connectToDatabase();
    const project = await Project.create({
      name: data.name,
      owner: data.owner,
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

export async function updateProjectInDb(id: string, data: { name?: string }) {
  try {
    await connectToDatabase();
    const project = await Project.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    return project;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  } finally {
    await disconnectFromDatabase();
  }
}

export async function deleteProjectInDb(id: string) {
  try {
    await connectToDatabase();
    await Project.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  } finally {
    await disconnectFromDatabase();
  }
}
