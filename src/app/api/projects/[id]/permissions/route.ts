import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db/connect"
import { BoardModel } from "@/models/board.model"
import { ProjectModel } from "@/models/project.model"
import { UserModel } from "@/models/user.model"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized - No session or email" }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const projectId = req.nextUrl.pathname.split("/projects/")[1]?.split("/")[0]
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is missing" }, { status: 400 })
    }

    const currentUser = await UserModel.findOne({
      email: session.user.email
    }).lean()
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const currentUserId = currentUser._id.toString()

    const project = await ProjectModel.findById(projectId).lean()
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const board = await BoardModel.findById(project.board).lean()
    if (!board) {
      // This case should ideally not happen if data integrity is maintained
      return NextResponse.json({ error: "Board not found for the project" }, { status: 404 })
    }

    // Permission logic: User can modify if they are project owner or board owner
    const projectOwnerId = (project.owner as any)?._id.toString()
    const boardOwnerId = (board.owner as any)?._id.toString()

    const isProjectOwner = projectOwnerId === currentUserId
    const isBoardOwner = boardOwnerId === currentUserId

    const canModify = isProjectOwner || isBoardOwner

    return NextResponse.json({
      canEditProject: canModify,
      canDeleteProject: canModify
    })
  } catch (error) {
    console.error("Error checking project permissions:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    )
  }
}
