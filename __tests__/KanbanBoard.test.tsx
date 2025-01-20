import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

describe('KanbanBoard', () => {
  it('renders the kanban board container', () => {
    render(<KanbanBoard />);
    const board = screen.getByTestId('kanban-board');
    expect(board).toBeInTheDocument();
  });
});
