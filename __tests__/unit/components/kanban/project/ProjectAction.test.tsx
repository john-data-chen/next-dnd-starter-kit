import { ProjectActions } from '@/components/kanban/project/ProjectAction';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock zustand store
const updateProjectMock = vi.fn();
const removeProjectMock = vi.fn();
const fetchProjectsMock = vi.fn();
vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: any) =>
    selector({
      updateProject: updateProjectMock,
      removeProject: removeProjectMock,
      fetchProjects: fetchProjectsMock,
      currentBoardId: 'b1'
    })
}));

// Mock toast
// Use vi.hoisted to define mocks before vi.mock
const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock
  }
}));

// Mock ProjectForm
vi.mock('@/components/kanban/project/ProjectForm', () => ({
  ProjectForm: ({ onSubmit, defaultValues, children }: any) => (
    <form
      data-testid="mock-project-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit({
          title: defaultValues.title || 'Edited Title',
          description: defaultValues.description || 'Edited Desc'
        });
      }}
    >
      {children}
    </form>
  )
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}));
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>
}));
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div role="menuitem" {...props}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div />
}));

// Mock fetch for permissions
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('ProjectActions', () => {
  const baseProps = {
    id: 'p1',
    title: 'Project 1',
    description: 'desc'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  it('should render dropdown menu button', () => {
    render(<ProjectActions {...baseProps} />);
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument();
  });

  it('should request permissions and show editable options when dropdown is clicked', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        canEditProject: true,
        canDeleteProject: true
      })
    });
    render(<ProjectActions {...baseProps} />);
    fireEvent.click(screen.getByTestId('project-option-button'));
    expect(screen.getByTestId('edit-project-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-project-button')).toBeInTheDocument();
  });

  it('should open edit dialog and submit when Edit is clicked', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        canEditProject: true,
        canDeleteProject: true
      })
    });
    render(<ProjectActions {...baseProps} />);
    fireEvent.click(screen.getByTestId('project-option-button'));
    fireEvent.click(screen.getByTestId('edit-project-button'));
  });

  it('should open delete dialog and confirm deletion when Delete is clicked', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        canEditProject: true,
        canDeleteProject: true
      })
    });
    render(<ProjectActions {...baseProps} />);
    fireEvent.click(screen.getByTestId('project-option-button'));
    fireEvent.click(screen.getByTestId('delete-project-button'));
    // Click Delete in AlertDialog
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(removeProjectMock).toHaveBeenCalledWith('p1');
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'Project: Project 1 is deleted'
    );
  });
  it('should show error toast when edit fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        canEditProject: true,
        canDeleteProject: true
      })
    });
    updateProjectMock.mockRejectedValueOnce(new Error('Update failed'));
    render(<ProjectActions {...baseProps} />);
    fireEvent.click(screen.getByTestId('project-option-button'));
    fireEvent.click(screen.getByTestId('edit-project-button'));
    fireEvent.submit(screen.getByTestId('mock-project-form'));
    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith(
        'Project updated fail：Update failed'
      )
    );
  });
});
