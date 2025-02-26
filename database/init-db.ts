import { connectToDatabase, disconnectFromDatabase } from '@/lib/db/connect';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';
import { User } from '../src/models/user.model';

async function main() {
  try {
    await connectToDatabase();

    // Create admin user
    const adminUser = await User.create({
      email: 'demo@example.com',
      name: 'admin',
      role: 'ADMIN'
    });

    // Create demo project
    const demoProject = await Project.create({
      name: 'Demo Project',
      description: 'This is a demo project',
      owner: adminUser._id,
      members: [adminUser._id]
    });

    // Create demo task
    const demoTask = await Task.create({
      title: 'First Task',
      description: 'This is our first task',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      project: demoProject._id,
      assignee: adminUser._id,
      assigner: adminUser._id
    });

    console.log('Created demo data:', {
      user: adminUser,
      project: demoProject,
      task: demoTask
    });
  } catch (error: any) {
    if (error.code === 11000) {
      console.log('Data already exists');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await disconnectFromDatabase();
  }
}

main().catch(console.error);
