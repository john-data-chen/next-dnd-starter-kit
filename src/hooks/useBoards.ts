'use client';

import { Board } from '@/types/dbInterface';
import { useEffect, useState } from 'react';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBoards() {
      setLoading(true);
      try {
        const response = await fetch('/api/boards');
        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBoards();
  }, []);

  return { boards, loading };
}
