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
    const boards = await BoardModel.insertMany([
      // John's team board
      {
        ...demoBoards[0],
        owner: users[1]._id, // John
        members: [users[1]._id, users[3]._id],
        projects: []
      },
      // Jane's team board
      {
        ...demoBoards[1],
        owner: users[2]._id, // Jane
        members: [users[1]._id, users[2]._id],
        projects: []
      },
      // Mark's personal board
      {
        title: "Mark's Personal Board",
        description: 'Private workspace for personal tasks',
        owner: users[3]._id, // Mark S
        members: [users[3]._id],
        projects: []
      }
    ]);
    console.log('Created boards successfully');

    // Create projects with board references
    const projects = await ProjectModel.insertMany(
      demoProjects.map((project, index) => ({
        ...project,
        owner: users[project.boardIndex === 0 ? 1 : 2]._id,
        members: [users[1]._id, users[2]._id],
        board: boards[index < 2 ? project.boardIndex : 2]._id // Ensure valid board reference
      }))
    );

    // Update boards with project references
    await Promise.all(
      boards.map(async (board) => {
        const boardProjects = projects.filter(
          (p) =>
            p.board && board._id && p.board.toString() === board._id.toString()
        );
        await BoardModel.findByIdAndUpdate(board._id, {
          projects: boardProjects.map((p) => p._id)
        });
      })
    );
    console.log('Updated boards with project references');

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
