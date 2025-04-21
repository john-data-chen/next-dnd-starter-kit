import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Board } from '@/components/kanban/board/Board';

// Mock useTaskStore
vi.mock('@/lib/store', () => {
  const mockState = {
    projects: [
      {
        _id: 'p1',
        title: 'Project 1',
        owner: { id: 'u1', name: 'User1' },
        members: [
          { id: 'u1', name: 'User1' },
          { id: 'u2', name: 'User2' }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [
          {
            _id: 't1',
            title: 'Task 1',
            description: 'desc',
            status: 'TODO',
            project: 'p1',
            board: 'b1',
            assignee: { id: 'u1', name: 'User1' },
            creator: { id: 'u1', name: 'User1' },
            lastModifier: { id: 'u1', name: 'User1' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
    ],
    filter: {},
    setProjects: vi.fn(),
    dragTaskOnProject: vi.fn(),
  };
  return {
    useTaskStore: (selector: any) => selector ? selector(mockState) : mockState,
  };
});

// Mock子元件
vi.mock('../project/NewProjectDialog', () => ({
  default: () => <div data-testid="new-project-dialog" />,
}));
vi.mock('../project/Project', () => ({
  BoardContainer: ({ children }: any) => <div>{children}</div>,
  BoardProject: ({ project }: any) => (
    <div data-testid="board-project">{project.title}</div>
  ),
}));
vi.mock('../task/TaskCard', () => ({
  TaskCard: () => <div data-testid="task-card" />,
}));
vi.mock('../task/TaskFilter', () => ({
  TaskFilter: () => <div data-testid="task-filter" />,
}));

describe('Board', () => {
  it('should render Board component and project correctly', () => {
    render(<Board />);
    expect(screen.getByTestId('board')).toBeInTheDocument();
    expect(screen.getByTestId('new-project-trigger')).toBeInTheDocument();
    expect(screen.getAllByText('Project 1')).toHaveLength(1);
    expect(screen.getByTestId('task-filter')).toBeInTheDocument();
  });
});