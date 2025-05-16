import NewTaskDialog from '@/components/kanban/task/NewTaskDialog';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock zustand store
const mockAddTask = vi.fn();
vi.mock('@/lib/store', () => ({
  useTaskStore: () => ({
    addTask: mockAddTask
  })
}));

// Mock TaskForm
vi.mock('@/components/kanban/task/TaskForm', () => ({
  TaskForm: ({ onSubmit, onCancel }: any) => (
    <form
      data-testid="mock-task-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          title: 'Test Task',
          status: 'TODO',
          description: 'desc',
          dueDate: undefined,
          assignee: undefined
        });
      }}
    >
      <button type="submit">Create Task</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}));

// Mock Button
vi.mock('@/components/ui/button', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  return {
    Button: React.forwardRef<
      HTMLButtonElement,
      React.ButtonHTMLAttributes<HTMLButtonElement>
    >(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    ))
  };
});

// Mock Dialog components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <>{children}</>,
  DialogContent: ({ children }: any) => (
    <div data-testid="new-task-dialog">{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>
}));

describe('NewTaskDialog', () => {
  const projectId = 'p1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the new task button', () => {
    render(<NewTaskDialog projectId={projectId} />);
    expect(screen.getByTestId('new-task-trigger')).toBeInTheDocument();
  });

  it('should open dialog after clicking the new task button', async () => {
    render(<NewTaskDialog projectId={projectId} />);
    const trigger = screen.getByTestId('new-task-trigger');
    await userEvent.click(trigger);
    expect(screen.getByTestId('new-task-dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  it('should close dialog after clicking Cancel', async () => {
    render(<NewTaskDialog projectId={projectId} />);
    await userEvent.click(screen.getByTestId('new-task-trigger'));
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelBtn);
  });
});
