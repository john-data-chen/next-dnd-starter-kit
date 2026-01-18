import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db/connect"
import { UserModel } from "@/models/user.model"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const users = await UserModel.find().select("_id email name")
    return NextResponse.json({ users })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
