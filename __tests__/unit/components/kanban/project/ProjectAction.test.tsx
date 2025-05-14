import { ProjectActions } from '@/components/kanban/project/ProjectAction';
// Make sure fireEvent is imported
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { toast } from 'sonner';
import { Mock, vi } from 'vitest';

// --- Mocks ---

// Mock global fetch
global.fetch = vi.fn();

// Mock useTaskStore
const mockUpdateProject = vi.fn();
const mockRemoveProject = vi.fn();
const mockFetchProjects = vi.fn();
const mockCurrentBoardId = 'b1';
vi.mock('@/lib/store', () => ({
  useTaskStore: vi.fn(() => ({
    updateProject: mockUpdateProject,
    removeProject: mockRemoveProject,
    fetchProjects: mockFetchProjects,
    currentBoardId: mockCurrentBoardId
  }))
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock ProjectForm - Simplified: Renders children and calls onSubmit when a submit button inside is clicked
vi.mock('@/components/kanban/project/ProjectForm', () => ({
  ProjectForm: ({
    children,
    onSubmit,
    defaultValues
  }: {
    children: React.ReactNode;
    onSubmit: (values: any) => Promise<void> | void; // Allow onSubmit to be async
    defaultValues: any;
  }) => (
    <form
      data-testid="mock-project-form"
      onSubmit={async (e) => {
        // Make the handler async
        e.preventDefault();
        try {
          await onSubmit(defaultValues); // Await the passed onSubmit
        } catch (error) {
          // Optional: Handle errors if needed, though the component itself should handle them
          console.error('Mock ProjectForm onSubmit error:', error);
        }
      }}
    >
      {/* Render children which should include the submit button */}
      {children}
    </form>
  )
}));

// Mock UI Components (Simplified - focus on interaction points)
vi.mock('@/components/ui/dropdown-menu', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ), // Render children directly
    DropdownMenuTrigger: ({
      children,
      asChild
    }: {
      children: React.ReactNode;
      asChild?: boolean;
    }) =>
      asChild ? (
        children // Render child directly if asChild is true
      ) : (
        <button data-testid="dropdown-trigger">{children}</button> // Render a button otherwise
      ),
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-content">{children}</div>
    ), // Make content identifiable
    DropdownMenuItem: ({
      children,
      onSelect,
      ...props
    }: {
      children: React.ReactNode;
      onSelect?: () => void;
      [key: string]: any;
    }) => (
      <button onClick={onSelect} {...props}>
        {children}
      </button>
    ), // Simulate item click
    DropdownMenuSeparator: () => <hr />
  };
});

// Simplified Dialog Mock
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="dialog-container">
        {/* Simulate close button/action */}
        <button
          data-testid="dialog-close-internal"
          onClick={() => onOpenChange?.(false)}
        >
          Internal Close
        </button>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  )
}));

// Simplified AlertDialog Mock
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({
    children,
    open,
    onOpenChange
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="alert-dialog-container">
        {/* Simulate close action */}
        <button
          data-testid="alert-dialog-close-internal"
          onClick={() => onOpenChange?.(false)}
        >
          Internal Close
        </button>
        {children}
      </div>
    ) : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h4>{children}</h4>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => <button {...props}>{children}</button> // Render as button
}));

// Mock Button component (ensure it renders as a button and mock variants)
vi.mock('@/components/ui/button', async (importOriginal) => {
  const original = await importOriginal<any>();
  // Import React inside the factory function
  const React = await vi.importActual<typeof import('react')>('react');
  return {
    ...original,
    // Add a mock for buttonVariants
    buttonVariants: vi.fn(() => 'mock-button-variant-class'), // Return a simple string or empty
    // Use the imported React object
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

// --- Test Data ---
const mockProps = {
  id: 'p123',
  title: 'Initial Project Title',
  description: 'Initial Description'
};

// Helper to mock fetch responses
const mockFetchPermissions = (
  permissions: { canEditProject: boolean; canDeleteProject: boolean } | null,
  ok = true,
  status = 200
) => {
  (fetch as Mock).mockResolvedValueOnce({
    ok,
    status,
    json: async () => permissions
  });
};

// --- Tests ---
describe('ProjectActions Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    (fetch as Mock).mockClear(); // Clear fetch mock specifically
    // Reset store mock return values if needed, e.g., for promises
    mockUpdateProject.mockResolvedValue(undefined);
    mockRemoveProject.mockResolvedValue(undefined);
    mockFetchProjects.mockResolvedValue(undefined);
  });

  it('should render the trigger button and show loading state initially', async () => {
    // Mock fetch to be pending initially to see loading state
    (fetch as Mock).mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<ProjectActions {...mockProps} />);
    const triggerButton = screen.getByTestId('project-option-button');
    expect(triggerButton).toBeInTheDocument();
    // Check for loading indicator (e.g., animate-pulse class or disabled state)
    // Depending on your loading indicator implementation, this might need adjustment
    expect(triggerButton).toBeDisabled(); // Button is disabled while loading
    // If you have a specific loading icon/class:
    // expect(triggerButton.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should open dropdown menu on trigger click after permissions are loaded', async () => {
    mockFetchPermissions({ canEditProject: true, canDeleteProject: true });
    const user = userEvent.setup();
    render(<ProjectActions {...mockProps} />);

    const triggerButton = screen.getByTestId('project-option-button');
    // Wait for permissions to load and button to be enabled
    await waitFor(() => expect(triggerButton).not.toBeDisabled());

    await user.click(triggerButton);

    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(editButton).toBeInTheDocument();
    expect(editButton).not.toBeDisabled();
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).not.toBeDisabled();
  });

  describe('With Permissions', () => {
    beforeEach(() => {
      mockFetchPermissions({ canEditProject: true, canDeleteProject: true });
    });

    it('should open edit dialog when "Edit" is clicked and user has permission', async () => {
      const user = userEvent.setup();
      render(<ProjectActions {...mockProps} />);
      const triggerButton = screen.getByTestId('project-option-button');
      await waitFor(() => expect(triggerButton).not.toBeDisabled());
      await user.click(triggerButton);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      expect(editButton).not.toBeDisabled();
      await user.click(editButton);

      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
      expect(screen.getByTestId('mock-project-form')).toBeInTheDocument();
    });

    it('should open delete dialog when "Delete" is clicked and user has permission', async () => {
      const user = userEvent.setup();
      render(<ProjectActions {...mockProps} />);
      const triggerButton = screen.getByTestId('project-option-button');
      await waitFor(() => expect(triggerButton).not.toBeDisabled());
      await user.click(triggerButton);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).not.toBeDisabled();
      await user.click(deleteButton);

      expect(screen.getByTestId('alert-dialog-content')).toBeInTheDocument();
    });
  });

  describe('Without Permissions', () => {
    beforeEach(() => {
      mockFetchPermissions({ canEditProject: false, canDeleteProject: false });
    });

    it('should disable "Edit" and "Delete" options and apply strikethrough style if user lacks permissions', async () => {
      const user = userEvent.setup();
      render(<ProjectActions {...mockProps} />);
      const triggerButton = screen.getByTestId('project-option-button');
      await waitFor(() => expect(triggerButton).not.toBeDisabled());
      await user.click(triggerButton);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      const deleteButton = screen.getByRole('button', { name: 'Delete' });

      expect(editButton).toBeDisabled();
      expect(editButton).toHaveClass('line-through');
      expect(editButton).toHaveClass('cursor-not-allowed');

      expect(deleteButton).toBeDisabled();
      expect(deleteButton).toHaveClass('line-through');
      expect(deleteButton).toHaveClass('cursor-not-allowed');
    });

    it('should not open edit dialog when "Edit" is clicked and user lacks permission', async () => {
      const user = userEvent.setup();
      render(<ProjectActions {...mockProps} />);
      const triggerButton = screen.getByTestId('project-option-button');
      await waitFor(() => expect(triggerButton).not.toBeDisabled());
      await user.click(triggerButton);

      const editButton = screen.getByRole('button', { name: 'Edit' });
      // Attempt to click even if disabled (userEvent might not trigger onSelect for disabled)
      // fireEvent.click(editButton) might be more direct for testing if onSelect is guarded
      if (!editButton.hasAttribute('disabled')) {
        // userEvent respects disabled
        await user.click(editButton);
      }

      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
    });

    it('should not open delete dialog when "Delete" is clicked and user lacks permission', async () => {
      const user = userEvent.setup();
      render(<ProjectActions {...mockProps} />);
      const triggerButton = screen.getByTestId('project-option-button');
      await waitFor(() => expect(triggerButton).not.toBeDisabled());
      await user.click(triggerButton);

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      if (!deleteButton.hasAttribute('disabled')) {
        await user.click(deleteButton);
      }

      expect(
        screen.queryByTestId('alert-dialog-content')
      ).not.toBeInTheDocument();
    });
  });

  it('should handle API error when fetching permissions and disable options', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server Error' })
    });
    const user = userEvent.setup();
    render(<ProjectActions {...mockProps} />);
    const triggerButton = screen.getByTestId('project-option-button');

    // Wait for loading to finish (even on error, it should)
    await waitFor(() => expect(triggerButton).not.toBeDisabled());

    // Check for toast error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Could not load permissions: Server Error')
      );
    });

    await user.click(triggerButton);

    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(editButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('should close edit dialog when "Cancel" is clicked', async () => {
    mockFetchPermissions({ canEditProject: true, canDeleteProject: true });
    const user = userEvent.setup();
    render(<ProjectActions {...mockProps} />);
    const triggerButton = screen.getByTestId('project-option-button');
    await waitFor(() => expect(triggerButton).not.toBeDisabled());

    // Open edit dialog
    await user.click(triggerButton);
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    // Assert dialog is closed
    await waitFor(() => {
      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
    });
  });
});
