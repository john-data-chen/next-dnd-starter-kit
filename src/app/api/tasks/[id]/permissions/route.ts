import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db/connect"
import { BoardModel } from "@/models/board.model"
import { ProjectModel } from "@/models/project.model"
import { TaskModel } from "@/models/task.model"
import { UserModel } from "@/models/user.model"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const taskId = req.nextUrl.pathname.split("/tasks/")[1].split("/")[0]
    const user = await UserModel.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userId = user._id.toString()

    const task = await TaskModel.findById(taskId).populate("creator")

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const [board, project] = await Promise.all([
      BoardModel.findById(task.board),
      ProjectModel.findById(task.project)
    ])

    if (!board || !project) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }
    const getUserId = (obj: any) => (obj?._id ? obj._id.toString() : obj?.toString())

    const canDelete =
      getUserId(board.owner) === userId ||
      getUserId(project.owner) === userId ||
      getUserId(task.creator) === userId

    const canEdit = canDelete || (task.assignee && getUserId(task.assignee) === userId)

    return NextResponse.json({ canDelete, canEdit })
  } catch (error) {
    console.error("Error checking permissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
