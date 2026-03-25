import { describe, expect, it, vi } from "vitest"

import { getCachedBoardById } from "@/lib/db/cached-board"
import { connectToDatabase } from "@/lib/db/connect"

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn()
}))

vi.mock("@/lib/db/connect", () => ({
  connectToDatabase: vi.fn()
}))

const mockLean = vi.fn()
vi.mock("@/models/board.model", () => ({
  BoardModel: {
    findById: vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnValue({
        lean: mockLean
      })
    })
  }
}))

describe("getCachedBoardById", () => {
  it("should fetch board and return mapped data", async () => {
    mockLean.mockResolvedValueOnce({
      _id: { toString: () => "test-id" },
      title: "Test Board",
      description: "Test Desc"
    })
    const board = await getCachedBoardById("test-id")
    expect(connectToDatabase).toHaveBeenCalled()
    expect(board).toEqual({
      _id: "test-id",
      title: "Test Board",
      description: "Test Desc"
    })
  })

  it("should return null if board not found", async () => {
    mockLean.mockResolvedValueOnce(null)
    const board = await getCachedBoardById("test-id-not-found")
    expect(board).toBeNull()
  })
})
