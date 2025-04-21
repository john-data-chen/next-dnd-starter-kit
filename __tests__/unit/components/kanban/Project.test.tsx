import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import NewProjectDialog from '@/components/kanban/project/NewProjectDialog';

// Mock useTaskStore
vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: any) =>
    selector({
      addProject: vi.fn().mockResolvedValue('mock-project-id'),
    }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NewProjectDialog', () => {
  it('should open dialog and submit new project', async () => {
    render(<NewProjectDialog />);
    fireEvent.click(screen.getByTestId('new-project-trigger'));
    expect(screen.getByTestId('new-project-dialog')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Project title'), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter project description'), {
      target: { value: 'Test Description' },
    });

    fireEvent.click(screen.getByTestId('submit-project-button'));

    const { toast } = await import('sonner');
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Project created successfully');
    });
  });
});