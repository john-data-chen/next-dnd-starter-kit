import { BoardOverview } from '@/components/kanban/BoardOverview';
import { kanbanOverview } from '@/constants/pageMetaData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: kanbanOverview.title,
  description: kanbanOverview.description
};

export default function BoardsPage() {
  return (
    <main className="container mx-auto p-6 flex-1 overflow-hidden">
      <BoardOverview />
    </main>
  );
}
