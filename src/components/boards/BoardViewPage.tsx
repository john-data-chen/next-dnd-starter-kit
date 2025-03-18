import PageContainer from '@/components/layout/PageContainer';
import { memo, Suspense } from 'react';
import { Board } from './Board';

const MemoizedBoard = memo(Board);

export default function BoardViewPage() {
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
