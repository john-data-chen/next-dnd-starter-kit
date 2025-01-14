import KanbanViewPage from '@/components/kanban/KanbanViewPage';

export const metadata = {
  title: 'Dashboard : Kanban',
  description: 'Support Drag and Drop to manage projects and tasks'
};

export default function KanbanPage(): JSX.Element {
  return (
    <div data-testid="kanban-page-container">
      <KanbanViewPage />;
    </div>
  );
}
