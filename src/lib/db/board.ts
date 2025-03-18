import { BoardModel as BoardCollection } from '@/models/board.model';
import { Board } from '@/types/dbInterface';
import { connectToDatabase } from './connect';
import { getUserByEmail } from './user';

export async function getBoardsFromDb(userEmail: string): Promise<Board[]> {
  try {
    await connectToDatabase();
    const user = await getUserByEmail(userEmail);
    if (!user) throw new Error('User not found');

    const boards = await BoardCollection.find({
      $or: [{ owner: user._id }, { members: user._id }]
    }).lean();

    return boards.map((board) => ({
      _id: board._id.toString(),
      title: board.title,
      description: board.description,
      owner: {
        id: user._id.toString(),
        name: user.name
      },
      members: board.members.map((memberId) => ({
        id: memberId.toString(),
        name: 'Member Name' // TODO: Fetch member names
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

    const newBoard = await BoardCollection.create({
      title,
      description,
      owner: user._id,
      members: [user._id],
      projects: []
    });

    return {
      ...newBoard.toObject(),
      owner: {
        id: user._id,
        name: user.name
      },
      members: [
        {
          id: user._id,
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
    const board = await BoardCollection.findByIdAndUpdate(
      boardId,
      { ...data },
      { new: true }
    ).lean();

    if (!board) return null;

    // 这里需要补充获取成员名称的逻辑
    return {
      ...board,
      owner: {
        id: board.owner.id,
        name: 'Owner Name'
      },
      members: board.members.map((member) => ({
        id: member.id,
        name: 'Member Name'
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
    await BoardCollection.findByIdAndDelete(boardId);
    return true;
  } catch (error) {
    console.error('Error in deleteBoardInDb:', error);
    return false;
  }
}
