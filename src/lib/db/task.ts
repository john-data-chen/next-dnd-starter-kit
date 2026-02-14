"use server"

import { Types } from "mongoose"

import { BoardModel } from "@/models/board.model"
import { ProjectModel } from "@/models/project.model"
import { TaskModel } from "@/models/task.model"
import { Task, TaskStatus } from "@/types/dbInterface"

import { connectToDatabase } from "./connect"
import { getUserByEmail, getUserById } from "./user"

// Define a base interface for both Mongoose documents and plain objects
interface TaskBase {
  _id: Types.ObjectId | string
  title: string
  description?: string
  status: TaskStatus
  dueDate?: Date
  board: Types.ObjectId | string
  project: Types.ObjectId | string
  assignee?: Types.ObjectId | string | { id: string; name: string }
  creator: Types.ObjectId | string | { id: string; name: string }
  lastModifier: Types.ObjectId | string | { id: string; name: string }
  createdAt: Date | string
  updatedAt: Date | string
  __v?: number
}

async function convertTaskToPlainObject(taskDoc: TaskBase): Promise<Task> {
  if (!taskDoc) {
    throw new Error("Task document is undefined")
  }
  const getObjectIdString = (
    id: Types.ObjectId | string | { id: string } | null | undefined
  ): string => {
    if (!id) {
      return ""
    }
    if (id instanceof Types.ObjectId) {
      return id.toHexString()
    }
    if (typeof id === "object" && "id" in id) {
      return id.id
    }
    return String(id)
  }

  const creatorId = getObjectIdString(taskDoc.creator)

  const modifierId = getObjectIdString(taskDoc.lastModifier)

  if (!creatorId || !modifierId) {
    throw new Error(
      `Task document missing required fields: creator (${JSON.stringify(taskDoc.creator)}) or lastModifier (${JSON.stringify(taskDoc.lastModifier)})`
    )
  }

  const assigneeId = taskDoc.assignee ? getObjectIdString(taskDoc.assignee) : undefined

  const [assigneeUser, creatorUser, modifierUser] = await Promise.all([
    assigneeId ? getUserById(assigneeId) : Promise.resolve(null),
    getUserById(creatorId),
    getUserById(modifierId)
  ])

  if (!creatorUser || !modifierUser) {
    throw new Error("Unable to find creator or modifier user data")
  }

  const boardId = getObjectIdString(taskDoc.board)

  const projectId = getObjectIdString(taskDoc.project)

  const docId = getObjectIdString(taskDoc._id)

  return {
    _id: docId,
    title: taskDoc.title,
    description: taskDoc.description || "",
    status: taskDoc.status || TaskStatus.TODO,
    dueDate: taskDoc.dueDate,
    board: boardId,
    project: projectId,
    assignee:
      assigneeUser && assigneeId
        ? {
            id: assigneeId,
            name: assigneeUser.name
          }
        : undefined,
    creator: {
      id: creatorId,
      name: creatorUser.name
    },
    lastModifier: {
      id: modifierId,
      name: modifierUser.name
    },
    createdAt:
      typeof taskDoc.createdAt === "string" ? new Date(taskDoc.createdAt) : taskDoc.createdAt,
    updatedAt:
      typeof taskDoc.updatedAt === "string" ? new Date(taskDoc.updatedAt) : taskDoc.updatedAt
  }
}

async function getBoardByProjectId(projectId: string): Promise<string | undefined> {
  try {
    await connectToDatabase()
    const project = await ProjectModel.findById(projectId)
    return project?.board?.toString()
  } catch (error) {
    console.error("Error fetching board:", error)
    throw error
  }
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  try {
    await connectToDatabase()
    const tasks = await TaskModel.find({ project: projectId }).lean()
    const taskPromises = tasks.map(async (task) => convertTaskToPlainObject(task as TaskBase))
    return await Promise.all(taskPromises)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    throw error
  }
}

async function ensureUserIsMember(projectId: string, userId: string): Promise<void> {
  const project = await ProjectModel.findById(projectId)
  if (!project) {
    throw new Error("Project not found")
  }

  const boardId = project.board
  const board = await BoardModel.findById(boardId)
  if (!board) {
    throw new Error("Board not found")
  }

  const getObjectIdString = (id: any): string => {
    if (id instanceof Types.ObjectId) {
      return id.toHexString()
    }
    return String(id)
  }

  const isProjectMember = project.members.some((member) => getObjectIdString(member) === userId)

  const isBoardMember = board.members.some((member) => getObjectIdString(member) === userId)

  if (!isProjectMember) {
    await ProjectModel.findByIdAndUpdate(projectId, {
      $addToSet: { members: userId }
    })
  }

  if (!isBoardMember) {
    await BoardModel.findByIdAndUpdate(boardId, {
      $addToSet: { members: userId }
    })
  }
}

export async function createTaskInDb(
  projectId: string,
  title: string,
  userEmail: string,
  description?: string,
  dueDate?: Date,
  assigneeId?: string,
  status: "TODO" | "IN_PROGRESS" | "DONE" = "TODO"
): Promise<Task> {
  try {
    await connectToDatabase()
    const creator = await getUserByEmail(userEmail)
    if (!creator) {
      throw new Error("Creator not found")
    }

    const boardId = await getBoardByProjectId(projectId)
    if (!boardId) {
      throw new Error("Board not found")
    }

    if (assigneeId) {
      await ensureUserIsMember(projectId, assigneeId)
    }

    const taskData = {
      title,
      description,
      status,
      dueDate,
      board: boardId,
      project: projectId,
      assignee: assigneeId,
      creator: creator.id,
      lastModifier: creator.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const newTask = await TaskModel.create(taskData)
    return await convertTaskToPlainObject(newTask.toObject() as TaskBase)
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

export async function updateTaskInDb(
  taskId: string,
  title: string,
  userEmail: string,
  status: "TODO" | "IN_PROGRESS" | "DONE" = "TODO",
  description?: string,
  dueDate?: Date,
  assigneeId?: string
): Promise<Task> {
  try {
    await connectToDatabase()
    const modifier = await getUserByEmail(userEmail)
    if (!modifier) {
      throw new Error("Modifier not found")
    }
    const task = await TaskModel.findById(taskId)
    if (!task) {
      throw new Error("Task not found")
    }

    if (assigneeId) {
      await ensureUserIsMember(task.project.toString(), assigneeId)
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        status,
        dueDate,
        assignee: assigneeId,
        lastModifier: modifier.id,
        updatedAt: new Date()
      },
      { returnDocument: "after" }
    )

    if (!updatedTask) {
      throw new Error("Task not found")
    }

    return await convertTaskToPlainObject(updatedTask.toObject() as TaskBase)
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

export async function updateTaskProjectInDb(
  userEmail: string,
  taskId: string,
  newProjectId: string
): Promise<Task> {
  try {
    await connectToDatabase()

    const user = await getUserByEmail(userEmail)
    if (!user) {
      throw new Error("User not found")
    }

    const targetProject = await ProjectModel.findById(newProjectId)
    if (!targetProject) {
      throw new Error("Target project not found")
    }

    const task = await TaskModel.findById(taskId)
    if (!task) {
      throw new Error("Task not found")
    }

    const getObjectIdString = (id: any): string => {
      if (!id) {
        return ""
      }
      if (id instanceof Types.ObjectId) {
        return id.toHexString()
      }
      return String(id)
    }

    const isTargetProjectOwner = getObjectIdString(targetProject.owner) === user.id.toString()
    const isTargetProjectMember = targetProject.members.some(
      (member) => getObjectIdString(member) === user.id.toString()
    )
    const isTaskCreator = getObjectIdString(task.creator) === user.id.toString()
    const isTaskAssignee = task.assignee
      ? getObjectIdString(task.assignee) === user.id.toString()
      : false

    if (!(isTargetProjectOwner || (isTargetProjectMember && (isTaskCreator || isTaskAssignee)))) {
      throw new Error("Permission denied: You do not have sufficient permissions to move this task")
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        project: newProjectId,
        lastModifier: user.id,
        updatedAt: new Date()
      },
      { returnDocument: "after" }
    )

    if (!updatedTask) {
      throw new Error("Failed to update task")
    }

    return await convertTaskToPlainObject(updatedTask.toObject() as TaskBase)
  } catch (error) {
    console.error("Error updating task project:", error)
    throw error
  }
}

export async function deleteTaskInDb(taskId: string): Promise<void> {
  try {
    await connectToDatabase()
    const task = await TaskModel.findById(taskId)
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`)
    }
    await TaskModel.findByIdAndDelete(taskId)
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}
