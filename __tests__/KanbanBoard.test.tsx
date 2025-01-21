import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

describe('KanbanBoard', () => {
  it('renders the kanban board container', () => {
    render(<KanbanBoard />);
    const board = screen.getByTestId('kanban-board');
    expect(board).toBeInTheDocument();
  });

  it('renders the project containers', () => {
    render(<KanbanBoard />);
    const projectContainers = screen.getAllByTestId('project-container');
    expect(projectContainers).toHaveLength(2);
  });

  it('renders the task containers', () => {
    render(<KanbanBoard />);
    const project1 = screen.getAllByTestId('project-container')[0];
    const taskContainers = project1.querySelectorAll(
      '[data-testid="task-card"]'
    );
    expect(taskContainers).toHaveLength(2);
  });
});
