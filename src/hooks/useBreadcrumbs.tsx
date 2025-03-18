'use client';

import { ROUTES } from '@/constants/routes';
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

  useEffect(() => {
    async function fetchBoard() {
      if (!boardId) return;
      try {
        const response = await fetch(`/api/boards/${boardId}`);
        const data = await response.json();
        setBoard(data);
      } catch (error) {
        console.error('Failed to fetch board:', error);
      }
    }

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  const items: BreadcrumbItem[] = [{ title: 'Kanban', link: ROUTES.HOME }];

  if (board) {
    items.push({
      title: board.title,
      link: `/boards/${board._id}`
    });
  }

  return items;
}
