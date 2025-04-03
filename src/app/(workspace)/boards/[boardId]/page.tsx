'use client';

import { Board } from '@/components/boards/Board';
import PageContainer from '@/components/layout/PageContainer';
import { useTaskStore } from '@/lib/store';
import { useParams } from 'next/navigation';
import { memo, Suspense, useEffect } from 'react';

const MemoizedBoard = memo(Board);

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.boardId as string;
  const setCurrentBoardId = useTaskStore((state) => state.setCurrentBoardId);
  const fetchProjects = useTaskStore((state) => state.fetchProjects);

  useEffect(() => {
    if (!boardId) return;
    setCurrentBoardId(boardId);
    fetchProjects(boardId);
  }, [boardId, setCurrentBoardId, fetchProjects]);

  return (
    <PageContainer>
      <div role="main" className="space-y-4">
        <Suspense fallback={<div>Loading board...</div>}>
          <MemoizedBoard />
        </Suspense>
      </div>
    </PageContainer>
  );
}
