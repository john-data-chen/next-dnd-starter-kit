import { TaskForm } from '@/components/kanban/task/TaskForm';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock ResizeObserver globally
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('TaskForm Component', () => {
  it('renders task title input', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
  });

  it('renders due date picker', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId('task-date-picker-trigger')).toBeInTheDocument();
  });

  it('renders assignee selector', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders status radio buttons', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText('To Do')).toBeInTheDocument();
    expect(screen.getByLabelText('In Progress')).toBeInTheDocument();
    expect(screen.getByLabelText('Done')).toBeInTheDocument();
  });

  it('renders task description input', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);
    const submitButton = screen.getByTestId('submit-task-button');
    fireEvent.click(submitButton);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByTestId('cancel-task-button');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
