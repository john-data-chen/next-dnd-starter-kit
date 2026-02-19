"use client"

// Assuming Board type is needed for setMyBoards/setTeamBoards
import { useCallback, useEffect, useState } from "react"

import { fetchBoardsFromDb } from "@/lib/db/board"
import { useAuthStore, useBoardStore } from "@/lib/stores"
import { Board } from "@/types/dbInterface"

export function useBoards() {
  const [loading, setLoading] = useState(true)
  const userEmail = useAuthStore((state) => state.userEmail)
  const userId = useAuthStore((state) => state.userId)
  const myBoards = useBoardStore((state) => state.myBoards)
  const teamBoards = useBoardStore((state) => state.teamBoards)
  const setMyBoards = useBoardStore((state) => state.setMyBoards)
  const setTeamBoards = useBoardStore((state) => state.setTeamBoards)

  const fetchBoards = useCallback(async () => {
    if (!userEmail || !userId) {
      setMyBoards([]) // If no userEmail or userId, clear boards
      setTeamBoards([])
      setLoading(false) // And set loading to false
      return
    }
    setLoading(true)
    let boardsFromDB: Board[] = []
    try {
      boardsFromDB = await fetchBoardsFromDb(userEmail)

      const userMyBoards: Board[] = []
      const userTeamBoards: Board[] = []

      boardsFromDB.forEach((board) => {
        // Ensure board.owner and board.owner.id exist before comparing
        if (board.owner && typeof board.owner !== "string" && board.owner.id === userId) {
          userMyBoards.push(board)
        } else {
          userTeamBoards.push(board)
        }
      })

      setMyBoards(userMyBoards)
      setTeamBoards(userTeamBoards)
    } catch (error) {
      console.error("Failed to fetch boards:", error)
      setMyBoards([]) // Clear boards on error
      setTeamBoards([])
    } finally {
      setLoading(false)
    }
  }, [userEmail, userId, setMyBoards, setTeamBoards])

  useEffect(() => {
    fetchBoards().catch(console.error)
  }, [fetchBoards])

  return { myBoards, teamBoards, loading, fetchBoards }
}
