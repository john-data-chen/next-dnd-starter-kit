import { ProjectActions } from '@/components/kanban/project/ProjectAction';
// Make sure fireEvent is imported
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { toast } from 'sonner';
import { vi } from 'vitest';

// --- Mocks ---

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
      onSubmit={async (e) => { // Make the handler async
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

// --- Tests ---
describe('ProjectActions Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Reset store mock return values if needed, e.g., for promises
    mockUpdateProject.mockResolvedValue(undefined);
    mockRemoveProject.mockResolvedValue(undefined);
    mockFetchProjects.mockResolvedValue(undefined);
  });

  it('should render the trigger button', () => {
    render(<ProjectActions {...mockProps} />);
    // Use data-testid to find the button
    expect(
      screen.getByTestId('project-option-button') // Updated selector
    ).toBeInTheDocument();
  });

  it('should open dropdown menu on trigger click', async () => {
    const user = userEvent.setup();
    render(<ProjectActions {...mockProps} />);
    // Use data-testid to find the button
    const triggerButton = screen.getByTestId('project-option-button'); // Updated selector

    await user.click(triggerButton);

    // Check if dropdown content appears (using the mock's testid)
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should open edit dialog when "Edit" is clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectActions {...mockProps} />);
    // Use data-testid to find the button
    const triggerButton = screen.getByTestId('project-option-button'); // Updated selector

    await user.click(triggerButton);
    const editButton = screen.getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    // Check if dialog content appears
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Edit Project')).toBeInTheDocument(); // DialogTitle
    expect(screen.getByTestId('mock-project-form')).toBeInTheDocument(); // Mocked form
  });

  it('should close edit dialog when "Cancel" is clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectActions {...mockProps} />);
    // Use data-testid to find the button
    const triggerButton = screen.getByTestId('project-option-button'); // Updated selector

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
