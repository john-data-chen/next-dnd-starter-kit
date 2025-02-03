import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewTaskDialog from '@/components/kanban/NewTaskDialog';
import { jest } from '@jest/globals';

describe('NewTaskDialog', () => {
  const projectId = 'test-project-id';

  it('renders the add task button', () => {
    render(<NewTaskDialog projectId={projectId} />);

    const button = screen.getByTestId('new-task-trigger');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('＋ Add New Task');
  });

  it('opens dialog when clicking the add button', () => {
    render(<NewTaskDialog projectId={projectId} />);

    const button = screen.getByTestId('new-task-trigger');
    fireEvent.click(button);

    expect(screen.getByTestId('new-task-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-trigger')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('date-picker-trigger'));
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });
});
