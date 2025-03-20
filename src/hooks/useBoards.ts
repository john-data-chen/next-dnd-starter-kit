'use client';

import { fetchBoardsFromDb } from '@/lib/db/board';
import { useTaskStore } from '@/lib/store';
import { Board } from '@/types/dbInterface';
import { useEffect, useState } from 'react';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = useTaskStore((state) => state.userId);
  const userEmail = useTaskStore((state) => state.userEmail);

  useEffect(() => {
    async function fetchBoards() {
      if (!userEmail) return;

      setLoading(true);
      try {
        const data = await fetchBoardsFromDb(userEmail);
        setBoards(data);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, [userEmail]);

  const myBoards = boards.filter((board) => board.owner.id === userId);
  const teamBoards = boards.filter(
    (board) =>
      board.members.some((m) => m.id === userId) && board.owner.id !== userId
  );

  return {
    myBoards,
    teamBoards,
    loading
  };
}
