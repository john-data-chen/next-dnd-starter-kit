import { TaskForm } from '@/components/kanban/task/TaskForm';
import { useTaskForm } from '@/hooks/useTaskForm';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// --- Global Mocks ---
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// --- Vitest Mocks ---
const mockHandleSubmit = vi.fn((e) => e.preventDefault());
const mockOnCancel = vi.fn();
const mockSetSearchQuery = vi.fn();

vi.mock('@/hooks/useTaskForm', () => ({
  useTaskForm: vi.fn(() => ({
    form: {
      control: {},
      handleSubmit: (fn: any) => fn
    },
    isSubmitting: false,
    users: [],
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,
    isSearching: false,
    assignOpen: false,
    setAssignOpen: vi.fn(),
    handleSubmit: mockHandleSubmit
  }))
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

// --- Test Suite ---
describe('TaskForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields with translated labels and placeholders', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={mockOnCancel} />);

    // Check for translated labels and placeholders
    expect(screen.getByLabelText('titleLabel')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('titlePlaceholder')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('dueDateLabel')).toBeInTheDocument();
    expect(screen.getByText('pickDate')).toBeInTheDocument(); // from date picker trigger
    expect(screen.getByLabelText('assignToLabel')).toBeInTheDocument();
    expect(screen.getByText('selectUser')).toBeInTheDocument(); // from assignee trigger
    expect(screen.getByLabelText('statusLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('descriptionLabel')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('descriptionPlaceholder')
    ).toBeInTheDocument();

    // Check for translated radio button labels
    expect(screen.getByLabelText('statusTodo')).toBeInTheDocument();
    expect(screen.getByLabelText('statusInProgress')).toBeInTheDocument();
    expect(screen.getByLabelText('statusDone')).toBeInTheDocument();
  });

  it('calls handleSubmit when the submit button is clicked', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    const submitButton = screen.getByTestId('submit-task-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  it('calls onCancel when the cancel button is clicked', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByTestId('cancel-task-button');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('uses the provided submitLabel for the submit button', () => {
    const customLabel = 'updateTask';
    render(<TaskForm onSubmit={vi.fn()} submitLabel={customLabel} />);
    const submitButton = screen.getByTestId('submit-task-button');
    expect(submitButton).toHaveTextContent(customLabel);
  });
});
