'use client'

import { memo, Suspense, useEffect } from 'react'
import { Board } from '@/components/kanban/board/Board'
import PageContainer from '@/components/layout/PageContainer'
import { useTaskStore } from '@/lib/store'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

const MemoizedBoard = memo(Board)

export default function BoardPage() {
  const params = useParams()
  const t = useTranslations('kanban')
  const boardId = params?.boardId as string | string[] | undefined
  const normalizedBoardId = Array.isArray(boardId) ? boardId[0] : boardId
  const setCurrentBoardId = useTaskStore((state) => state.setCurrentBoardId)
  const fetchProjects = useTaskStore((state) => state.fetchProjects)

  useEffect(() => {
    if (!normalizedBoardId) {
      return
    }
    setCurrentBoardId(normalizedBoardId)
    ;(async () => {
      try {
        await fetchProjects(normalizedBoardId)
      } catch (error) {
        console.error(error)
      }
    })().catch(console.error)
  }, [normalizedBoardId, setCurrentBoardId, fetchProjects])

  return (
    <PageContainer>
      <main className="space-y-4">
        <Suspense fallback={<div>{t('loadingBoard')}</div>}>
          <MemoizedBoard />
        </Suspense>
      </main>
    </PageContainer>
  )
}
