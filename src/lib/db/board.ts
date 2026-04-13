"use server"

import { Types } from "mongoose"

import { BoardModel } from "@/models/board.model"
import { ProjectModel } from "@/models/project.model"
import { Board, Project } from "@/types/dbInterface"

import { connectToDatabase } from "./connect"
import { getUserByEmail, getUserById } from "./user"
import { getObjectIdString } from "./utils"

// Type for populated owner document (from mongoose populate)
interface PopulatedOwnerDoc {
  _id: Types.ObjectId
  name: string
}

// Type for non-populated owner document (UserInfo structure)
interface PlainOwnerDoc {
  id: string
  name: string
}

// Type for populated member document
interface PopulatedMemberDoc {
  _id: Types.ObjectId
  name: string
}

// Type for populated project document within a board
interface PopulatedProjectDoc {
  _id: Types.ObjectId
  title: string
  description?: string
  board?: Types.ObjectId | { toString(): string }
  owner: PopulatedOwnerDoc
  members: PopulatedMemberDoc[]
  createdAt: Date | string
  updatedAt: Date | string
}

// Type for populated board document
interface PopulatedBoardDocument {
  _id: Types.ObjectId | string
  title: string
  description?: string
  owner: Types.ObjectId | string | PopulatedOwnerDoc | PlainOwnerDoc
  members: (Types.ObjectId | string | PopulatedMemberDoc | PlainOwnerDoc)[]
  projects: (
    | Types.ObjectId
    | string
    | PopulatedProjectDoc
    | {
        _id: string
        title: string
        description?: string
        board?: string
        owner?: { _id?: string; id?: string; name: string }
        members?: { _id?: string; id?: string; name: string }[]
        createdAt?: Date | string
        updatedAt?: Date | string
      }
  )[]
  createdAt: Date | string
  updatedAt: Date | string
}

export async function fetchBoardsFromDb(userEmail: string): Promise<Board[]> {
  try {
    await connectToDatabase()
    const user = await getUserByEmail(userEmail)
    if (!user) {
      console.warn(`User not found for email: ${userEmail}. Returning empty board list.`)
      return []
    }

    const query = {
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
    return boardsFromDb.map((board) =>
      convertBoardToPlainObject(board as PopulatedBoardDocument, userMap)
    )
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

function convertBoardToPlainObject(
  boardDoc: PopulatedBoardDocument,
  userMap: Map<string, string>
): Board {
  const owner = boardDoc.owner
  const ownerId =
    typeof owner === "object" && "_id" in owner ? owner._id.toString() : getObjectIdString(owner)
  const ownerName =
    typeof owner === "object" && "name" in owner
      ? owner.name
      : userMap.get(ownerId) || "Unknown User"

  return {
    _id: boardDoc._id.toString(),
    title: boardDoc.title,
    description: boardDoc.description || "",
    owner: {
      id: ownerId,
      name: ownerName
    },
    members: boardDoc.members.filter(Boolean).map((member) => {
      const id =
        typeof member === "object" && "_id" in member
          ? member._id.toString()
          : getObjectIdString(member)
      const name =
        typeof member === "object" && "name" in member
          ? member.name
          : userMap.get(id) || "Unknown User"
      return {
        id,
        name
      }
    }),
    projects: (boardDoc.projects || [])
      .filter(Boolean)
      .map((p): Project => {
        const projectDoc = p as PopulatedProjectDoc

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
          members: (projectDoc.members || []).filter(Boolean).map((m) => ({
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

    const board = await BoardModel.findByIdAndUpdate(
      boardId,
      { ...data },
      { returnDocument: "after" }
    ).lean()

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

    return convertBoardToPlainObject(board as PopulatedBoardDocument, userMap)
  } catch (error) {
    console.error("Error in updateBoardInDb:", error)
    return null
  }
}

export async function getBoardById(
  boardId: string
): Promise<{ _id: string; title: string; description?: string } | null> {
  try {
    await connectToDatabase()
    const board = await BoardModel.findById(boardId).select("title description").lean()
    if (!board) {
      return null
    }
    return {
      _id: board._id.toString(),
      title: board.title,
      description: board.description
    }
  } catch (error) {
    console.error("Error in getBoardById:", error)
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
    const projectIds = board.projects.map((p) => (typeof p === "string" ? p : p._id))
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
