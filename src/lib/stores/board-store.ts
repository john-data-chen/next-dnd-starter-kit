import { create } from "zustand"
import { persist } from "zustand/middleware"

import { deleteBoardInDb, updateBoardInDb } from "@/lib/db/board"
import { Board } from "@/types/dbInterface"

import { useAuthStore } from "./auth-store"

interface BoardState {
  currentBoardId: string | null
  myBoards: Board[]
  teamBoards: Board[]
  setCurrentBoardId: (boardId: string) => void
  setMyBoards: (boards: Board[]) => void
  setTeamBoards: (boards: Board[]) => void
  addBoard: (title: string, description?: string) => Promise<string>
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>
  removeBoard: (id: string) => Promise<void>
  resetBoards: () => void
}

function requireEmail(): string {
  const email = useAuthStore.getState().userEmail
  if (!email) {
    throw new Error("User email not found")
  }
  return email
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      currentBoardId: null,
      myBoards: [],
      teamBoards: [],
      setCurrentBoardId: (boardId: string) => set({ currentBoardId: boardId }),
      setMyBoards: (boards: Board[]) => set({ myBoards: boards }),
      setTeamBoards: (boards: Board[]) => set({ teamBoards: boards }),
      addBoard: async (title: string, description?: string) => {
        requireEmail() // Validate user is authenticated
        try {
          const baseUrl = typeof window === "undefined" ? "http://localhost:3000" : ""
          const response = await fetch(`${baseUrl}/api/boards`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description })
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to create board")
          }
          const data = await response.json()
          const boardId = data.boardId
          set({ currentBoardId: boardId })
          return boardId
        } catch (error) {
          console.error("Error in addBoard:", error)
          throw error
        }
      },
      updateBoard: async (id: string, data: Partial<Board>) => {
        const userEmail = requireEmail()
        const updatedBoard = await updateBoardInDb(id, data, userEmail)
        if (!updatedBoard) {
          throw new Error("Failed to update board")
        }
      },
      removeBoard: async (id: string) => {
        const userEmail = requireEmail()
        const success = await deleteBoardInDb(id, userEmail)
        if (!success) {
          throw new Error("Failed to delete board")
        }
      },
      resetBoards: () =>
        set({
          myBoards: [],
          teamBoards: [],
          currentBoardId: null
        })
    }),
    { name: "board-store" }
  )
)
