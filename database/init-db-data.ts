import {
  demoBoards,
  demoProjects,
  demoTasks,
  demoUsers
} from '@/constants/demoData';
import { connectToDatabase } from '@/lib/db/connect';
import mongoose from 'mongoose';
import readline from 'readline';
import { BoardModel } from '../src/models/board.model';
import { ProjectModel } from '../src/models/project.model';
import { TaskModel } from '../src/models/task.model';
import { UserModel } from '../src/models/user.model';

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
      BoardModel.deleteMany({}),
      ProjectModel.deleteMany({}),
      TaskModel.deleteMany({})
    ]);
    console.log('Database cleared');

    // Create users
    const users = await UserModel.insertMany(demoUsers);
    console.log('Created users successfully');

    // Create boards
    const boards = await BoardModel.insertMany([
      {
        ...demoBoards[0], // Mark's Kanban
        owner: users[2]._id, // Mark S
        members: [users[2]._id],
        projects: []
      },
      {
        ...demoBoards[1], // John's Kanban
        owner: users[0]._id, // John
        members: [users[0]._id],
        projects: []
      },
      {
        ...demoBoards[2], // Jane's Kanban
        owner: users[1]._id, // Jane
        members: [users[1]._id],
        projects: []
      },
      {
        ...demoBoards[3], // Dev Team Board
        owner: users[1]._id, // John
        members: [users[0]._id, users[1]._id, users[2]._id], // All developers
        projects: []
      }
    ]);
    console.log('Created boards successfully');

    // Create projects
    const projects = await ProjectModel.insertMany([
      {
        ...demoProjects[0], // Mark's todo list
        owner: users[2]._id, // Mark S
        members: [users[2]._id],
        board: boards[0]._id // In Mark's Kanban
      },
      {
        ...demoProjects[1], // Demo Project 2
        owner: users[0]._id, // John
        members: [users[0]._id, users[2]._id],
        board: boards[3]._id // In Dev Team Board
      },
      {
        ...demoProjects[2], // Demo Project 3
        owner: users[1]._id, // Jane
        members: [users[1]._id, users[2]._id],
        board: boards[3]._id // In Dev Team Board
      }
    ]);
    console.log('Created projects successfully');

    // Update boards with project references
    await Promise.all([
      BoardModel.findByIdAndUpdate(boards[0]._id, {
        $push: { projects: projects[0]._id }
      }),
      BoardModel.findByIdAndUpdate(boards[3]._id, {
        $push: { projects: { $each: [projects[1]._id, projects[2]._id] } }
      })
    ]);

    // Create tasks
    const tasks = await TaskModel.insertMany([
      {
        ...demoTasks[0],
        project: projects[0]._id,
        assignee: users[2]._id, // Mark S
        creator: users[2]._id,
        lastModifier: users[2]._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        ...demoTasks[1],
        project: projects[1]._id,
        assignee: users[0]._id, // John
        creator: users[1]._id, // Jane
        lastModifier: users[1]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        ...demoTasks[2],
        project: projects[2]._id,
        assignee: users[1]._id, // Jane
        creator: users[0]._id, // John
        lastModifier: users[1]._id, // Jane
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      }
    ]);
    console.log('Created tasks successfully');

    // Final data summary
    console.log('Final data:', {
      users: users.length,
      boards: boards.length,
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
