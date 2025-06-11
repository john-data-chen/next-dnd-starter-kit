'use client';

import { ROUTES } from '@/constants/routes';
import { fetchBoardsFromDb } from '@/lib/db/board';
import { useTaskStore } from '@/lib/store';
import { Board } from '@/types/dbInterface';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
  isRoot?: boolean;
};

export function useBreadcrumbs() {
  const params = useParams();
  const boardId = params.boardId as string;
  const locale =
    (Array.isArray(params.locale) ? params.locale[0] : params.locale) || 'en';
  const [board, setBoard] = useState<Board | null>(null);
  const userEmail = useTaskStore((state) => state.userEmail);

  useEffect(() => {
    async function fetchBoard() {
      if (!boardId || !userEmail) return;
      try {
        const boards = await fetchBoardsFromDb(userEmail);
        const currentBoard = boards.find((b) => b._id === boardId);
        if (currentBoard) {
          setBoard(currentBoard);
        }
      } catch (error) {
        console.error('Failed to fetch board:', error);
      }
    }

    if (boardId) {
      fetchBoard();
    }
  }, [boardId, userEmail]);

  const rootLinkWithLocale = `/${locale}${ROUTES.BOARDS.ROOT}`;

  const items: BreadcrumbItem[] = [
    {
      title: 'Overview',
      link: rootLinkWithLocale,
      isRoot: true
    }
  ];

  if (board) {
    items.push({
      title: board.title,
      link: `/${locale}/boards/${board._id}`
    });
  }

  return {
    items,
    rootLink: rootLinkWithLocale
  };
}
