import { connectToDatabase, disconnectFromDatabase } from '@/lib/db/connect';
import { Project } from '../src/models/project.model';
import { Task } from '../src/models/task.model';
import { User } from '../src/models/user.model';

async function main() {
  try {
    await connectToDatabase();

    // Create admin user
    const users = await User.insertMany([
      {
        email: 'demo@example.com',
        name: 'Admin',
        role: 'ADMIN'
      },
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'USER'
      }
    ]);

    // Bulk create projects
    const projects = await Project.insertMany([
      {
        name: 'Demo Project 1',
        description: 'This is demo project 1',
        owner: users[0]._id,
        members: [users[0]._id, users[1]._id]
      },
      {
        name: 'Demo Project 2',
        description: 'This is demo project 2',
        owner: users[1]._id,
        members: [users[0]._id, users[1]._id]
      }
    ]);

    // Bulk create tasks
    const tasks = await Task.insertMany([
      {
        title: 'Task 1',
        description: 'This is our first task',
        dueDate: new Date(Date.now()),
        project: projects[0]._id,
        assignee: users[1]._id,
        assigner: users[0]._id
      },
      {
        title: 'Task 2',
        description: 'This is task 2',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        project: projects[0]._id,
        assignee: users[1]._id,
        assigner: users[1]._id
      },
      {
        title: 'Task 3',
        description: 'This is task 3',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        project: projects[1]._id,
        assignee: users[1]._id,
        assigner: users[0]._id
      }
    ]);

    console.log('Created demo data:', {
      users,
      projects,
      tasks
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
