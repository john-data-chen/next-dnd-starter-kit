'use server';

import { BoardModel } from '@/models/board.model';
import { ProjectModel } from '@/models/project.model';
import { Board, BoardDocument } from '@/types/dbInterface';
import { connectToDatabase } from './connect';
import { getUserByEmail } from './user';

export async function fetchBoardsFromDb(userEmail: string): Promise<Board[]> {
  try {
    await connectToDatabase();
    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const boards = await BoardModel.find({
      $or: [{ owner: user.id }, { members: user.id }]
    }).lean();

    const projectIds = boards.reduce((ids: string[], board) => {
      return ids.concat(board.projects.map((id) => id.toString()));
    }, []);

    const projects = await ProjectModel.find({
      _id: { $in: projectIds }
    }).lean();

    const projectMap = new Map();
    projects.forEach((project) => {
      projectMap.set(project._id.toString(), {
        id: project._id.toString(),
        title: project.title
      });
    });

    const userIds = new Set<string>();
    boards.forEach((board) => {
      userIds.add(board.owner.toString());
      board.members.forEach((memberId) => userIds.add(memberId.toString()));
    });

    const { getUserById } = await import('./user');
    const userPromises = Array.from(userIds).map((id) => getUserById(id));
    const users = await Promise.all(userPromises);

    const userMap = new Map();
    users.forEach((user) => {
      if (user) {
        userMap.set(user.id, user.name);
      }
    });

    return boards.map((board) => ({
      _id: board._id.toString(),
      title: board.title,
      description: board.description,
      owner: {
        id: board.owner.toString(),
        name: userMap.get(board.owner.toString()) || 'unknown user'
      },
      members: board.members.map((memberId) => ({
        id: memberId.toString(),
        name: userMap.get(memberId.toString()) || 'unknown user'
      })),
      projects: board.projects.map(
        (projectId) =>
          projectMap.get(projectId.toString()) || {
            id: projectId.toString(),
            title: '0'
          }
      ),
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    }));
  } catch (error) {
    console.error('Error in getBoardsFromDb:', error);
    return [];
  }
}

async function convertBoardToPlainObject(
  boardDoc: BoardDocument
): Promise<Board> {
  return {
    _id: boardDoc._id.toString(),
    title: boardDoc.title,
    description: boardDoc.description || '',
    owner: {
      id:
        typeof boardDoc.owner === 'object' && 'name' in boardDoc.owner
          ? boardDoc.owner.id.toString()
          : boardDoc.owner.toString(),
      name:
        typeof boardDoc.owner === 'object' && 'name' in boardDoc.owner
          ? boardDoc.owner.name
          : 'unknown user'
    },
    members: (boardDoc.members || []).map((member) => ({
      id:
        typeof member === 'object' && 'name' in member
          ? member.id.toString()
          : member.toString(),
      name:
        typeof member === 'object' && 'name' in member
          ? member.name
          : 'unknown user'
    })),
    projects: (boardDoc.projects || []).map((project) => ({
      id: project.toString(),
      title: 'Unknown Project'
    })),
    createdAt: boardDoc.createdAt ? new Date(boardDoc.createdAt) : new Date(),
    updatedAt: boardDoc.updatedAt ? new Date(boardDoc.updatedAt) : new Date()
  };
}

export async function createBoardInDb({
  title,
  userEmail,
  description
}: {
  title: string;
  userEmail: string;
  description?: string;
}): Promise<Board | null> {
  try {
    await connectToDatabase();
    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const newBoard = await BoardModel.create({
      title,
      description,
      owner: user.id,
      members: [user.id],
      projects: []
    });

    // Convert to plain object and ensure correct types
    const plainBoard = {
      _id: newBoard._id,
      title: newBoard.title,
      description: newBoard.description,
      owner: user.id,
      members: [user.id],
      projects: [],
      createdAt: newBoard.createdAt,
      updatedAt: newBoard.updatedAt
    };

    return convertBoardToPlainObject(plainBoard);
  } catch (error) {
    console.error('Error in createBoardInDb:', error);
    return null;
  }
}

export async function updateBoardInDb(
  boardId: string,
  data: Partial<Board>,
  userEmail: string
): Promise<Board | null> {
  try {
    await connectToDatabase();

    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const existingBoard = await BoardModel.findById(boardId).lean();
    if (!existingBoard) throw new Error('Board not found');

    if (existingBoard.owner.toString() !== user.id) {
      throw new Error('Unauthorized: Only board owner can update the board');
    }

    const board = await BoardModel.findByIdAndUpdate(
      boardId,
      { ...data },
      { new: true }
    ).lean();

    if (!board) return null;

    const boardDoc = {
      _id: board._id,
      title: board.title,
      description: board.description,
      owner: board.owner,
      members: board.members,
      projects: board.projects.map((p) => p.id || p),
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    };

    return convertBoardToPlainObject(boardDoc as BoardDocument);
  } catch (error) {
    console.error('Error in updateBoardInDb:', error);
    return null;
  }
}

export async function deleteBoardInDb(
  boardId: string,
  userEmail: string
): Promise<boolean> {
  try {
    await connectToDatabase();

    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const board = await BoardModel.findById(boardId).lean();
    if (!board) throw new Error('Board not found');

    if (board.owner.toString() !== user.id) {
      throw new Error('Unauthorized: Only board owner can delete the board');
    }

    const { TaskModel } = await import('@/models/task.model');
    await TaskModel.deleteMany({
      project: { $in: board.projects }
    });

    await ProjectModel.deleteMany({ board: boardId });
    await BoardModel.findByIdAndDelete(boardId);

    return true;
  } catch (error) {
    console.error('Error in deleteBoardInDb:', error);
    return false;
  }
}
