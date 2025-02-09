import { memo, Suspense } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { KanbanBoard } from './KanbanBoard';

const MemoizedKanbanBoard = memo(KanbanBoard);

export default function KanbanViewPage() {
  return (
    <PageContainer>
      <div role="main" className="space-y-4">
        <Suspense fallback={<div>Loading kanban board...</div>}>
          <MemoizedKanbanBoard />
        </Suspense>
      </div>
    </PageContainer>
  );
}
