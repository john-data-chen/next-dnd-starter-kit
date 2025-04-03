'use client';

import { fetchBoardsFromDb } from '@/lib/db/board';
import { useTaskStore } from '@/lib/store';
import { useCallback, useEffect, useState } from 'react';

export function useBoards() {
  const [loading, setLoading] = useState(true);
  const { userEmail, userId, myBoards, teamBoards } = useTaskStore();

  const fetchBoards = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const boards = await fetchBoardsFromDb(userEmail);

      const myBoardsList = boards.filter((board) => board.owner.id === userId);
      const teamBoardsList = boards.filter(
        (board) =>
          board.owner.id !== userId &&
          board.members.some((member) => member.id === userId)
      );

      const { setMyBoards, setTeamBoards } = useTaskStore.getState();
      setMyBoards(myBoardsList);
      setTeamBoards(teamBoardsList);
    } catch (error) {
      console.error('Error in fetchBoards:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail, userId]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return { myBoards, teamBoards, loading, fetchBoards };
}
