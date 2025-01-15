import KanbanViewPage from '@/components/kanban/KanbanViewPage';
import AppSidebar from '@/components/layout/app-sidebar';

export const metadata = {
  title: 'Kanban',
  description: 'Support Drag and Drop to manage projects and tasks'
};

export default function KanbanPage(): JSX.Element {
  return (
    <div data-testid="kanban-page-container">
      <AppSidebar />
      <KanbanViewPage />
    </div>
  );
}
