'use server'

import { BoardModel } from '@/models/board.model'
import { ProjectModel } from '@/models/project.model'
import { Board, BoardDocument, Project } from '@/types/dbInterface'
import { Types } from 'mongoose'
import { connectToDatabase } from './connect'
import { getUserByEmail, getUserById } from './user'

export async function fetchBoardsFromDb(userEmail: string): Promise<Board[]> {
  try {
    await connectToDatabase()
    const user = await getUserByEmail(userEmail)
    if (!user) {
      console.warn(`User not found for email: ${userEmail}. Returning empty board list.`)
      return []
    }

    const boardsFromDb = await BoardModel.find({
      $or: [{ owner: user.id }, { members: user.id }]
    })
      .populate({
        path: 'projects',
        populate: {
          path: 'owner members',
          select: 'name' // Only select name for nested owner/members
        }
      })
      .lean()

    const allUserIds = new Set<string>()
    boardsFromDb.forEach((board: any) => {
      allUserIds.add((board.owner as Types.ObjectId).toHexString())
      ;(board.members as Types.ObjectId[]).forEach((memberId) => allUserIds.add(memberId.toHexString()))
    })

    const userMap = await getUserMap(Array.from(allUserIds))

    return boardsFromDb.map((board) => convertBoardToPlainObject(board as BoardDocument, userMap))
  } catch (error) {
    console.error('Error in getBoardsFromDb:', error)
    return []
  }
}

async function getUserMap(userIds: string[]): Promise<Map<string, string>> {
  const userMap = new Map<string, string>()
  const users = await Promise.all(userIds.map(async (id) => getUserById(id)))
  users.forEach((user) => {
    if (user) {
      userMap.set(user.id, user.name)
    }
  })
  return userMap
}

function convertBoardToPlainObject(boardDoc: BoardDocument, userMap: Map<string, string>): Board {
  const getOwnerId = (owner: any): string => {
    if (owner instanceof Types.ObjectId) {
      return owner.toHexString()
    }
    if (typeof owner === 'object' && owner !== null && 'id' in owner) {
      return owner.id
    }
    return String(owner)
  }
  const ownerId = getOwnerId(boardDoc.owner)
  return {
    _id: boardDoc._id.toString(),
    title: boardDoc.title,
    description: boardDoc.description || '',
    owner: {
      id: ownerId,
      name: userMap.get(ownerId) || 'Unknown User'
    },
    members: boardDoc.members.filter(Boolean).map((member) => {
      const id =
        member instanceof Types.ObjectId
          ? member.toHexString()
          : typeof member === 'object' && member !== null && 'id' in member
            ? member.id
            : String(member)
      return {
        id,
        name: userMap.get(id) || 'Unknown User'
      }
    }),
    projects: (boardDoc.projects || [])
      .filter(Boolean)
      .map((p: any): Project => {
        const projectDoc = p as {
          _id: Types.ObjectId
          title: string
          description?: string
          board?: Types.ObjectId | { toString(): string }
          owner: { _id: Types.ObjectId; name: string }
          members: { _id: Types.ObjectId; name: string }[]
          createdAt: Date | string
          updatedAt: Date | string
        }

        // Safely handle the board reference
        let boardId = ''
        if (projectDoc.board) {
          boardId = typeof projectDoc.board === 'object' ? projectDoc.board.toString() : String(projectDoc.board)
        }

        return {
          _id: projectDoc._id?.toString() || '',
          title: projectDoc.title || 'Untitled Project',
          description: projectDoc.description || '',
          board: boardId,
          owner: projectDoc.owner
            ? {
                id: projectDoc.owner?._id?.toString() || '',
                name: projectDoc.owner?.name || 'Unknown'
              }
            : { id: '', name: 'Unknown' },
          members: (projectDoc.members || [])
            .filter(Boolean)
            .map((m: { _id: Types.ObjectId | string; name: string }) => ({
              id: typeof m._id === 'object' ? m._id.toString() : String(m._id || ''),
              name: m.name || 'Unknown'
            })),
          tasks: [],
          createdAt: projectDoc.createdAt ? new Date(projectDoc.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: projectDoc.updatedAt ? new Date(projectDoc.updatedAt).toISOString() : new Date().toISOString()
        }
      })
      .filter(Boolean),
    createdAt: new Date(boardDoc.createdAt),
    updatedAt: new Date(boardDoc.updatedAt)
  }
}

export async function createBoardInDb({
  title,
  userEmail,
  description
}: {
  title: string
  userEmail: string
  description?: string
}): Promise<Board | null> {
  try {
    await connectToDatabase()
    const user = await getUserByEmail(userEmail)
    if (!user) {
      throw new Error('User not found')
    }

    const newBoard = await BoardModel.create({
      title,
      description,
      owner: user.id,
      members: [user.id],
      projects: []
    })

    const userMap = new Map([[user.id, user.name]])
    return convertBoardToPlainObject(newBoard.toObject(), userMap)
  } catch (error) {
    console.error('Error in createBoardInDb:', error)
    return null
  }
}

export async function updateBoardInDb(boardId: string, data: Partial<Board>, userEmail: string): Promise<Board | null> {
  try {
    await connectToDatabase()

    const user = await getUserByEmail(userEmail)
    if (!user) {
      throw new Error('User not found')
    }

    const existingBoard = await BoardModel.findById(boardId).lean()
    if (!existingBoard) {
      throw new Error('Board not found')
    }

    const getOwnerId = (owner: any): string => {
      if (owner instanceof Types.ObjectId) {
        return owner.toHexString()
      }
      if (typeof owner === 'object' && owner !== null && 'id' in owner) {
        return owner.id
      }
      return String(owner)
    }
    const ownerId = getOwnerId(existingBoard.owner)
    if (ownerId !== user.id) {
      throw new Error('Unauthorized: Only board owner can update the board')
    }

    const board = await BoardModel.findByIdAndUpdate(boardId, { ...data }, { new: true }).lean()

    if (!board) {
      return null
    }

    const allUserIds = new Set<string>()
    allUserIds.add((board as any).owner.toHexString())
    ;((board as any).members as Types.ObjectId[]).forEach((memberId) => allUserIds.add(memberId.toHexString()))
    const userMap = await getUserMap(Array.from(allUserIds))

    return convertBoardToPlainObject(board as BoardDocument, userMap)
  } catch (error) {
    console.error('Error in updateBoardInDb:', error)
    return null
  }
}

export async function deleteBoardInDb(boardId: string, userEmail: string): Promise<boolean> {
  try {
    await connectToDatabase()

    const user = await getUserByEmail(userEmail)
    if (!user) {
      throw new Error('User not found')
    }

    const board = await BoardModel.findById(boardId).lean()
    if (!board) {
      throw new Error('Board not found')
    }

    const getOwnerId = (owner: any): string => {
      if (owner instanceof Types.ObjectId) {
        return owner.toHexString()
      }
      if (typeof owner === 'object' && owner !== null && 'id' in owner) {
        return owner.id
      }
      return String(owner)
    }
    const ownerId = getOwnerId(board.owner)
    if (ownerId !== user.id) {
      throw new Error('Unauthorized: Only board owner can delete the board')
    }

    const { TaskModel } = await import('@/models/task.model')
    await TaskModel.deleteMany({
      project: { $in: board.projects }
    })

    await ProjectModel.deleteMany({ board: boardId })
    await BoardModel.findByIdAndDelete(boardId)

    return true
  } catch (error) {
    console.error('Error in deleteBoardInDb:', error)
    return false
  }
}
