"use server"

import { Types } from "mongoose"

import { BoardModel } from "@/models/board.model"
import { ProjectModel } from "@/models/project.model"
import { Board, BoardDocument, Project } from "@/types/dbInterface"

import { connectToDatabase } from "./connect"
import { getUserByEmail, getUserById } from "./user"

export async function fetchBoardsFromDb(userEmail: string): Promise<Board[]> {
  try {
    await connectToDatabase()
    const user = await getUserByEmail(userEmail)
    if (!user) {
      console.warn(`User not found for email: ${userEmail}. Returning empty board list.`)
      return []
    }

    const query: any = {
      $or: [{ owner: user.id }, { members: user.id }]
    }

    const boardsFromDb = await BoardModel.find(query)
      .populate("owner", "name")
      .populate("members", "name")
      .populate({
        path: "projects",
        populate: {
          path: "owner members",
          select: "name" // Only select name for nested owner/members
        }
      })
      .lean()

    const allUserIds = new Set<string>()
    boardsFromDb.forEach((board) => {
      const ownerId = typeof board.owner === "string" ? board.owner : board.owner.id
      allUserIds.add(ownerId)

      // Handle member IDs
      ;(board.members || []).forEach((member) => {
        const memberId = typeof member === "string" ? member : member.id
        allUserIds.add(memberId)
      })
    })

    const userMap = await getUserMap(Array.from(allUserIds))
    return boardsFromDb.map((board) => convertBoardToPlainObject(board as BoardDocument, userMap))
  } catch (error) {
    console.error("Error in getBoardsFromDb:", error)
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

const getObjectIdString = (id: any): string => {
  if (id instanceof Types.ObjectId) {
    return id.toHexString()
  }
  if (id && typeof id === "object" && id._id) {
    return getObjectIdString(id._id)
  }
  return String(id)
}

function convertBoardToPlainObject(boardDoc: BoardDocument, userMap: Map<string, string>): Board {
  const owner = boardDoc.owner as any
  const ownerId = owner._id ? owner._id.toString() : getObjectIdString(boardDoc.owner)
  const ownerName = owner.name || userMap.get(ownerId) || "Unknown User"

  return {
    _id: boardDoc._id.toString(),
    title: boardDoc.title,
    description: boardDoc.description || "",
    owner: {
      id: ownerId,
      name: ownerName
    },
    members: boardDoc.members.filter(Boolean).map((member: any) => {
      const id = member._id ? member._id.toString() : getObjectIdString(member)
      const name = member.name || userMap.get(id) || "Unknown User"
      return {
        id,
        name
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
        let boardId = ""
        if (projectDoc.board) {
          boardId =
            typeof projectDoc.board === "object"
              ? projectDoc.board.toString()
              : String(projectDoc.board)
        }

        return {
          _id: projectDoc._id?.toString() || "",
          title: projectDoc.title || "Untitled Project",
          description: projectDoc.description || "",
          board: boardId,
          owner: projectDoc.owner
            ? {
                id: projectDoc.owner?._id?.toString() || "",
                name: projectDoc.owner?.name || "Unknown"
              }
            : { id: "", name: "Unknown" },
          members: (projectDoc.members || [])
            .filter(Boolean)
            .map((m: { _id: Types.ObjectId | string; name: string }) => ({
              id: typeof m._id === "object" ? m._id.toString() : String(m._id || ""),
              name: m.name || "Unknown"
            })),
          tasks: [],
          createdAt: projectDoc.createdAt
            ? new Date(projectDoc.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: projectDoc.updatedAt
            ? new Date(projectDoc.updatedAt).toISOString()
            : new Date().toISOString()
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
      throw new Error("User not found")
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
    console.error("Error in createBoardInDb:", error)
    return null
  }
}

export async function updateBoardInDb(
  boardId: string,
  data: Partial<Board>,
  userEmail: string
): Promise<Board | null> {
  try {
    await connectToDatabase()

    const user = await getUserByEmail(userEmail)
    if (!user) {
      throw new Error("User not found")
    }

    const existingBoard = await BoardModel.findById(boardId).lean()
    if (!existingBoard) {
      throw new Error("Board not found")
    }

    const existingOwnerId = getObjectIdString(existingBoard.owner)
    if (existingOwnerId !== user.id) {
      throw new Error("Unauthorized: Only board owner can update the board")
    }

    const board = await BoardModel.findByIdAndUpdate(boardId, { ...data }, { new: true }).lean()

    if (!board) {
      return null
    }

    const allUserIds = new Set<string>()
    const ownerId = getObjectIdString(board.owner)
    allUserIds.add(ownerId)

    // Handle member IDs
    ;(board.members || []).forEach((member) => {
      const memberId = getObjectIdString(member)
      allUserIds.add(memberId)
    })
    const userMap = await getUserMap(Array.from(allUserIds))

    return convertBoardToPlainObject(board as BoardDocument, userMap)
  } catch (error) {
    console.error("Error in updateBoardInDb:", error)
    return null
  }
}

export async function deleteBoardInDb(boardId: string, userEmail: string): Promise<boolean> {
  try {
    await connectToDatabase()

    const user = await getUserByEmail(userEmail)
    if (!user) {
      throw new Error("User not found")
    }

    const board = await BoardModel.findById(boardId).lean()
    if (!board) {
      throw new Error("Board not found")
    }

    const boardOwnerId = getObjectIdString(board.owner)
    if (boardOwnerId !== user.id) {
      throw new Error("Unauthorized: Only board owner can delete the board")
    }

    const { TaskModel } = await import("@/models/task.model")
    const projectIds = board.projects.map((p: any) => (typeof p === "string" ? p : p._id))
    await TaskModel.deleteMany({
      project: { $in: projectIds }
    })

    await ProjectModel.deleteMany({ board: boardId })
    await BoardModel.findByIdAndDelete(boardId)

    return true
  } catch (error) {
    console.error("Error in deleteBoardInDb:", error)
    return false
  }
}
