'use server';

import { BoardModel } from '@/models/board.model';
import { ProjectModel } from '@/models/project.model';
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
            title: 'Unknown Project'
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
