import NewBoardDialog from '@/components/kanban/board/NewBoardDialog';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';


// Mock useTaskStore
vi.mock('@/lib/store', () => ({
  useTaskStore: () => ({
    addBoard: vi.fn().mockResolvedValue('mock-board-id'),
  }),
}));

// Mock useBoards
vi.mock('@/hooks/useBoards', () => ({
  useBoards: () => ({
    fetchBoards: vi.fn(),
  }),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock BoardForm
vi.mock('@/components/kanban/board/BoardForm', () => ({
  BoardForm: ({ onSubmit, children }: any) => (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ title: 'Test Board', description: 'desc' });
      }}
    >
      {children}
    </form>
  ),
}));

describe('NewBoardDialog', () => {
  it('should open dialog and submit new board', async () => {
    render(
      <NewBoardDialog>
        <button data-testid="new-board-trigger">New Board</button>
      </NewBoardDialog>
    );

    fireEvent.click(screen.getByTestId('new-board-trigger'));
    expect(screen.getByTestId('new-board-dialog-title')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('create-button'));

    const { toast } = await import('sonner');
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Board created successfully');
    });
  });
});