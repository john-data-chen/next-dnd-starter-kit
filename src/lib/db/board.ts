'use server';

import { BoardModel } from '@/models/board.model';
import { Board } from '@/types/dbInterface';
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

    return boards.map((board) => ({
      _id: board._id.toString(),
      title: board.title,
      description: board.description,
      owner: {
        id: user.id.toString(),
        name: user.name
      },
      members: board.members.map((member) => ({
        id: member.id.toString(),
        name: member.name
      })),
      projects: board.projects.map((id) => id.toString()),
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    }));
  } catch (error) {
    console.error('Error in getBoardsFromDb:', error);
    return [];
  }
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

    return {
      ...newBoard.toObject(),
      owner: {
        id: user.id,
        name: user.name
      },
      members: [
        {
          id: user.id,
          name: user.name
        }
      ]
    };
  } catch (error) {
    console.error('Error in createBoardInDb:', error);
    return null;
  }
}

export async function updateBoardInDb(
  boardId: string,
  data: Partial<Board>
): Promise<Board | null> {
  try {
    await connectToDatabase();
    const board = await BoardModel.findByIdAndUpdate(
      boardId,
      { ...data },
      { new: true }
    ).lean();

    if (!board) return null;

    return {
      ...board,
      owner: {
        id: board.owner.id,
        name: board.owner.name
      },
      members: board.members.map((member) => ({
        id: member.id,
        name: member.name
      }))
    };
  } catch (error) {
    console.error('Error in updateBoardInDb:', error);
    return null;
  }
}

export async function deleteBoardInDb(boardId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    await BoardModel.findByIdAndDelete(boardId);
    return true;
  } catch (error) {
    console.error('Error in deleteBoardInDb:', error);
    return false;
  }
}
