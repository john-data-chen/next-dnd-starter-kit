import NewTaskDialog from '@/components/kanban/NewTaskDialog';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

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
    fireEvent.click(screen.getByTestId('new-task-trigger'));

    expect(screen.getByTestId('new-task-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-date-picker-trigger')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('task-date-picker-trigger'));
    expect(screen.getByTestId('task-date-picker-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('submit-task-button')).toBeInTheDocument();
  });
});
