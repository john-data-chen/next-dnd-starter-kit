import { render, screen } from '@testing-library/react';
import KanbanPage, { metadata } from '@/app/dashboard/kanban/page';
import '@testing-library/jest-dom';

describe('KanbanPage', () => {
  it('renders kanban page', () => {
    render(<KanbanPage />);
    const container = screen.getByTestId('kanban-page-container');
    expect(container).toBeInTheDocument();

    expect(metadata.title).toBe('Dashboard : Kanban');
    expect(metadata.description).toBe(
      'Support Drag and Drop to manage projects and tasks'
    );
  });
});
