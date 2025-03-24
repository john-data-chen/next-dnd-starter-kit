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
};

export function useBreadcrumbs() {
  const params = useParams();
  const boardId = params.boardId as string;
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

  const items: BreadcrumbItem[] = [
    { title: 'Kanban', link: ROUTES.BOARDS.ROOT }
  ];

  if (board) {
    items.push({
      title: board.title,
      link: `/boards/${board._id}`
    });
  }

  return items;
}
