import { connectToDatabase } from '@/lib/db/connect';
import mongoose from 'mongoose';
import readline from 'readline';
import { ProjectModel } from '../src/models/project.model';
import { TaskModel } from '../src/models/task.model';
import { UserModel } from '../src/models/user.model';
import { demoUsers } from '@/constants/db'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function confirmDatabaseReset(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(
      '\x1b[31mWarning: This will clear all existing data! Continue? (y/N) \x1b[0m',
      (answer) => {
        resolve(answer.toLowerCase() === 'y');
        rl.close();
      }
    );
  });
}

async function main() {
  try {
    const shouldContinue = await confirmDatabaseReset();
    if (!shouldContinue) {
      console.log('Operation cancelled');
      process.exit(0);
    }

    await connectToDatabase();

    // Clear all collections
    console.log('Clearing database...');
    await Promise.all([
      UserModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      TaskModel.deleteMany({})
    ]);
    console.log('Database cleared');

    // Create admin user
    const users = await UserModel.insertMany(demoUsers);
    console.log('Created users successfully');

    // Bulk create projects
    const projects = await ProjectModel.insertMany([
      {
        title: 'Demo Project 1',
        description: 'This is demo project 1',
        owner: users[0]._id,
        members: [users[0]._id, users[1]._id]
      },
      {
        title: 'Demo Project 2',
        description: 'This is demo project 2',
        owner: users[2]._id,
        members: [users[0]._id, users[1]._id, users[2]._id]
      }
    ]);
    console.log('Created projects successfully');

    // Bulk create tasks
    const tasks = await TaskModel.insertMany([
      {
        title: 'Task 1',
        description: 'This is our first task',
        status: 'TODO',
        dueDate: new Date(Date.now()),
        project: projects[0]._id,
        assignee: users[1]._id,
        creator: users[0]._id,
        lastModifier: users[0]._id
      },
      {
        title: 'Task 2',
        description: 'This is task 2',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        project: projects[0]._id,
        assignee: users[1]._id,
        creator: users[2]._id,
        lastModifier: users[1]._id
      },
      {
        title: 'Task 3',
        description: 'This is task 3',
        status: 'DONE',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        project: projects[1]._id,
        assignee: users[1]._id,
        creator: users[0]._id,
        lastModifier: users[2]._id
      }
    ]);
    console.log('Created tasks successfully');

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
