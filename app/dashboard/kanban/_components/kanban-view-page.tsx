import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { KanbanBoard } from './kanban-board';

export default function KanbanViewPage() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading title={`Kanban`} description="Manage tasks by dnd" />
        </div>
        <KanbanBoard />
      </div>
    </PageContainer>
  );
}
