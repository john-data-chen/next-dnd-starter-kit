import { Metadata } from "next"

import { getCachedBoardById } from "@/lib/db/cached-board"

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string; boardId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { boardId } = await params
  try {
    const board = await getCachedBoardById(boardId)
    return {
      title: board?.title ?? "Board"
    }
  } catch {
    return {
      title: "Board"
    }
  }
}

export default async function BoardDetailLayout({ children }: Props): Promise<React.ReactNode> {
  return children
}
