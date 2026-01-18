import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { createBoardInDb } from "@/lib/db/board"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const board = await createBoardInDb({
      title,
      userEmail: session.user.email,
      description
    })

    if (!board) {
      return NextResponse.json({ error: "Failed to create board" }, { status: 500 })
    }

    return NextResponse.json({ success: true, boardId: board._id })
  } catch (error) {
    console.error("Error creating board:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
