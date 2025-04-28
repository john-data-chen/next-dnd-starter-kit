import { TaskFilter } from '@/components/kanban/task/TaskFilter';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/lib/store', () => ({
  useTaskStore: vi.fn(() => ({
    filter: { status: null, search: '' },
    setFilter: vi.fn(),
    projects: [
      {
        tasks: [
          { status: 'TODO' },
          { status: 'IN_PROGRESS' },
          { status: 'DONE' }
        ]
      }
    ]
  }))
}));

describe('TaskFilter Component', () => {
  it('renders search input', () => {
    render(<TaskFilter />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders status filter', () => {
    render(<TaskFilter />);
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
  });
});
