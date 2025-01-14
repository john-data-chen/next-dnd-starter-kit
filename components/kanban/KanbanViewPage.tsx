import PageContainer from '@/components/layout/page-container';
import { KanbanBoard } from './kanban-board';

export default function KanbanViewPage() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <KanbanBoard />
      </div>
    </PageContainer>
  );
}
