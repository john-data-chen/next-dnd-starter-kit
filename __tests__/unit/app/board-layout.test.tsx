import { describe, expect, it, vi } from "vitest"

import BoardDetailLayout, {
  generateMetadata
} from "@/app/[locale]/(workspace)/boards/[boardId]/layout"
import { getCachedBoardById } from "@/lib/db/cached-board"

vi.mock("@/lib/db/cached-board", () => ({
  getCachedBoardById: vi.fn()
}))

describe("BoardDetailLayout", () => {
  it("renders children", async () => {
    const children = <div>Test Content</div>
    const result = await BoardDetailLayout({
      children,
      params: Promise.resolve({ locale: "en", boardId: "123" })
    })
    expect(result).toEqual(children)
  })

  describe("generateMetadata", () => {
    it("returns board title", async () => {
      vi.mocked(getCachedBoardById).mockResolvedValueOnce({
        _id: "123",
        title: "Test Board",
        description: "Desc"
      })
      const metadata = await generateMetadata({
        children: null as any,
        params: Promise.resolve({ locale: "en", boardId: "123" })
      })
      expect(metadata).toEqual({ title: "Test Board" })
    })

    it("returns default title if board not found", async () => {
      vi.mocked(getCachedBoardById).mockResolvedValueOnce(null)
      const metadata = await generateMetadata({
        children: null as any,
        params: Promise.resolve({ locale: "en", boardId: "123" })
      })
      expect(metadata).toEqual({ title: "Board" })
    })

    it("returns default title if fetch throws", async () => {
      vi.mocked(getCachedBoardById).mockRejectedValueOnce(new Error("Test Error"))
      const metadata = await generateMetadata({
        children: null as any,
        params: Promise.resolve({ locale: "en", boardId: "123" })
      })
      expect(metadata).toEqual({ title: "Board" })
    })
  })
})
