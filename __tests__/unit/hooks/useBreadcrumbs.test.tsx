import { act, renderHook } from "@testing-library/react"
import { useParams } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ROUTES } from "@/constants/routes"
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs"
import { fetchBoardsFromDb } from "@/lib/db/board"
import { useAuthStore } from "@/lib/stores/auth-store"

vi.mock("next/navigation", () => ({
  useParams: vi.fn()
}))

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock("@/lib/db/board", () => ({
  fetchBoardsFromDb: vi.fn().mockResolvedValue([])
}))

vi.mock("@/lib/stores/auth-store", () => ({
  useAuthStore: vi.fn()
}))

describe("useBreadcrumbs Hook", () => {
  const mockUserEmail = "test@example.com"
  const mockBoardId = "board123"
  const mockBoard = {
    _id: mockBoardId,
    title: "Test Board",
    description: "Test Description",
    owner: { id: "user123", name: "Test User" },
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchBoardsFromDb).mockResolvedValue([])
    vi.mocked(useParams).mockReturnValue({ boardId: mockBoardId })
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({
        userEmail: mockUserEmail,
        userId: "user123",
        setUserInfo: vi.fn(),
        clearUser: vi.fn()
      })
    )
  })

  it("should initialize with root breadcrumb", () => {
    const { result } = renderHook(() => useBreadcrumbs())

    expect(result.current.items).toEqual([
      {
        title: "overview",
        link: ROUTES.BOARDS.ROOT,
        isRoot: true
      }
    ])
    expect(result.current.rootLink).toBe(ROUTES.BOARDS.ROOT)
  })

  it("should fetch and add board breadcrumb when boardId exists", async () => {
    vi.mocked(fetchBoardsFromDb).mockResolvedValueOnce([mockBoard])

    const { result } = renderHook(() => useBreadcrumbs())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(result.current.items).toEqual([
      {
        title: "overview",
        link: ROUTES.BOARDS.ROOT,
        isRoot: true
      },
      {
        title: mockBoard.title,
        link: `/boards/${mockBoard._id}`
      }
    ])
  })

  it("should handle fetch error gracefully", async () => {
    const mockError = new Error("Fetch failed")
    vi.mocked(fetchBoardsFromDb).mockRejectedValueOnce(mockError)
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const { result } = renderHook(() => useBreadcrumbs())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch board:", mockError)
    expect(result.current.items).toHaveLength(1)

    consoleSpy.mockRestore()
  })

  it("should not fetch board when boardId is missing", async () => {
    vi.mocked(useParams).mockReturnValue({})

    renderHook(() => useBreadcrumbs())

    expect(fetchBoardsFromDb).not.toHaveBeenCalled()
  })

  it("should not fetch board when userEmail is missing", async () => {
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ userEmail: "", userId: "user123", setUserInfo: vi.fn(), clearUser: vi.fn() })
    )

    renderHook(() => useBreadcrumbs())

    expect(fetchBoardsFromDb).not.toHaveBeenCalled()
  })
})
