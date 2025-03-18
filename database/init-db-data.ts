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

    // Create boards with user references
    const boards = await BoardModel.insertMany(
      demoBoards.map((board, index) => ({
        ...board,
        owner: users[index === 0 ? 0 : 2]._id,
        members:
          index === 0
            ? [users[0]._id, users[1]._id]
            : [users[0]._id, users[1]._id, users[2]._id]
      }))
    );
    console.log('Created boards successfully');

    // Create projects with board reference
    const projects = await ProjectModel.insertMany(
      demoProjects.map((project) => ({
        ...project,
        owner: users[project.boardIndex === 0 ? 0 : 2]._id,
        members:
          project.boardIndex === 0
            ? [users[0]._id, users[1]._id]
            : [users[0]._id, users[1]._id, users[2]._id],
        board: boards[project.boardIndex]._id
      }))
    );
    console.log('Created projects successfully');

    // Update boards with projects
    await Promise.all(
      boards.map((board, index) =>
        BoardModel.findByIdAndUpdate(board._id, {
          $push: { projects: projects[index]._id }
        })
      )
    );

    // Create tasks with all references
    const tasks = await TaskModel.insertMany(
      demoTasks.map((task) => ({
        ...task,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        project: projects[task.projectIndex]._id,
        assignee: users[task.assigneeIndex]._id,
        creator: users[task.creatorIndex]._id,
        lastModifier: users[task.creatorIndex]._id
      }))
    );
    console.log('Created tasks successfully');

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
