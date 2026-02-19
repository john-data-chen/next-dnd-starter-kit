"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { memo, Suspense, useEffect, useRef } from "react"

import { Board } from "@/components/kanban/board/Board"
import PageContainer from "@/components/layout/PageContainer"
import { useBoardStore, useProjectStore } from "@/lib/stores"

const MemoizedBoard = memo(Board)

export default function BoardPage() {
  const params = useParams()
  const t = useTranslations("kanban")
  const boardId = params?.boardId as string | string[] | undefined
  const normalizedBoardId = Array.isArray(boardId) ? boardId[0] : boardId
  const setCurrentBoardId = useBoardStore((state) => state.setCurrentBoardId)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!normalizedBoardId) {
      return
    }

    // Abort previous fetch if board changed
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setCurrentBoardId(normalizedBoardId)

    let cancelled = false
    ;(async () => {
      try {
        await fetchProjects(normalizedBoardId)
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch projects:", error)
        }
      }
    })().catch(() => {})

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [normalizedBoardId, setCurrentBoardId, fetchProjects])

  return (
    <PageContainer>
      <main className="space-y-4">
        <Suspense fallback={<div>{t("loadingBoard")}</div>}>
          <MemoizedBoard />
        </Suspense>
      </main>
    </PageContainer>
  )
}
