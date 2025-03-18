import BoardViewPage from '@/components/boards/BoardViewPage';

export const metadata = {
  title: 'board title: need to load from db',
  description: 'board description need to load from db'
};

export default function BoardPage() {
  return (
    <div data-testid="board-page-container">
      <BoardViewPage />
    </div>
  );
}
