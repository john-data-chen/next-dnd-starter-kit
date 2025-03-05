import { connectToDatabase } from '@/lib/db/connect';
import mongoose from 'mongoose';
import { ProjectModel } from '../src/models/project.model';
import { TaskModel } from '../src/models/task.model';
import { UserModel } from '../src/models/user.model';


async function main() {
  try {
    await connectToDatabase();

    // Create admin user
    let users;
    try {
      users = await UserModel.insertMany([
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
      console.log('Created users successfully');
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('Users already exist, continuing...');
        users = await UserModel.find({
          email: { $in: ['demo@example.com', 'john.doe@example.com'] }
        });
      } else {
        throw error;
      }
    }

    // Bulk create projects
    let projects;
    try {
      projects = await ProjectModel.find({
        title: { $in: ['Demo Project 1', 'Demo Project 2'] }
      });
      if (projects.length === 0) {
        console.log('Some projects already exist, continuing...');
      projects = await ProjectModel.insertMany([
        {
          title: 'Demo Project 1',
          description: 'This is demo project 1',
          owner: users[0]._id,
          members: [users[0]._id, users[1]._id]
        },
        {
          title: 'Demo Project 2',
          description: 'This is demo project 2',
          owner: users[1]._id,
          members: [users[0]._id, users[1]._id]
        }
      ]);
      console.log('Created projects successfully');
      } else {
        console.log('Projects already exist, continuing...');
      }
    } catch (error: any) {
      throw error;
    }

    // Bulk create tasks
    let tasks;
    try {
      tasks = await TaskModel.find({
        title: { $in: ['Task 1', 'Task 2', 'Task 3'] }
      });
      if (tasks.length === 0) {
      tasks = await TaskModel.insertMany([
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
      console.log('Created tasks successfully');
      } else {
        console.log('Tasks already exist, continuing...');
      }
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('Tasks already exist, fetching existing tasks...');
        tasks = await TaskModel.find({
          title: { $in: ['Task 1', 'Task 2', 'Task 3'] }
        });
      } else {
        throw error;
      }
    }

    console.log('Final data:', {
      users: users.length,
      projects: projects.length,
      tasks: tasks.length
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);