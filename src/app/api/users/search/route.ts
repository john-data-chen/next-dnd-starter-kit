import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db/connect"
import { UserModel } from "@/models/user.model"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const searchParams = req.nextUrl.searchParams
    const username = searchParams.get("username")

    let query = {}
    if (username) {
      query = {
        $or: [{ name: { $regex: username, $options: "i" } }]
      }
    }

    const users = await UserModel.find(query).select("_id email name")

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}
