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
  });

  it('disables submit button when title is empty', () => {
    render(<NewTaskDialog projectId={projectId} />);

    fireEvent.click(screen.getByTestId('new-task-trigger'));
    const submitButton = screen.getByTestId('submit-task-button');

    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when title has value', () => {
    render(<NewTaskDialog projectId={projectId} />);

    fireEvent.click(screen.getByTestId('new-task-trigger'));
    const titleInput = screen.getByTestId('task-title-input');
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    const submitButton = screen.getByTestId('submit-task-button');

    expect(submitButton).not.toBeDisabled();
  });

  it('calls onTaskAdd when form is submitted', () => {
    const onTaskAdd = jest.fn();
    render(<NewTaskDialog projectId={projectId} onTaskAdd={onTaskAdd} />);

    fireEvent.click(screen.getByTestId('new-task-trigger'));

    const titleInput = screen.getByTestId('task-title-input');
    const descriptionInput = screen.getByTestId('task-description-input');

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Task Description' }
    });

    const form = screen.getByTestId('new-task-form');
    fireEvent.submit(form);

    expect(onTaskAdd).toHaveBeenCalledWith('New Task', 'Task Description');
  });

  it('resets form after submission', () => {
    render(<NewTaskDialog projectId={projectId} />);

    fireEvent.click(screen.getByTestId('new-task-trigger'));

    const titleInput = screen.getByTestId('task-title-input');
    const descriptionInput = screen.getByTestId('task-description-input');

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, {
      target: { value: 'Task Description' }
    });

    const form = screen.getByTestId('new-task-form');
    fireEvent.submit(form);

    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });
});
