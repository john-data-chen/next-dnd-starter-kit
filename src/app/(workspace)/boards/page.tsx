import { BoardOverview } from '@/components/boards/BoardOverview';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kanban Overview',
  description: 'Manage your boards'
};

export default function BoardsPage() {
  return (
    <main className="container mx-auto p-6 flex-1 overflow-hidden">
      <BoardOverview />
    </main>
  );
}
