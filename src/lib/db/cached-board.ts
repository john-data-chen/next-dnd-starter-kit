"use cache"

import { cacheLife, cacheTag } from "next/cache"

import { connectToDatabase } from "./connect"

/**
 * Cached board fetch for server components (metadata, layouts).
 * For client-side real-time data, use the Zustand store actions instead.
 */
export async function getCachedBoardById(boardId: string) {
  cacheLife("minutes")
  cacheTag(`board-${boardId}`)

  await connectToDatabase()
  const { BoardModel } = await import("@/models/board.model")
  const board = await BoardModel.findById(boardId).populate("owner", "name email").lean()
  return board
    ? { _id: board._id.toString(), title: board.title, description: board.description }
    : null
}
