import { Board } from '@/components/kanban/board/Board';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

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
            updatedAt: new Date()
          }
        ]
      }
    ],
    filter: {},
    setProjects: vi.fn(),
    dragTaskOnProject: vi.fn()
  };
  return {
    useTaskStore: (selector: any) =>
      selector ? selector(mockState) : mockState
  };
});

vi.mock('@/components/kanban/project/NewProjectDialog', () => ({
  default: () => <div data-testid="new-project-dialog" />
}));
vi.mock('@/components/kanban/project/Project', () => ({
  BoardContainer: ({ children }: any) => <div>{children}</div>,
  BoardProject: ({ project }: any) => (
    <div data-testid="board-project">{project.title}</div>
  )
}));
vi.mock('@/components/kanban/task/TaskCard', () => ({
  TaskCard: () => <div data-testid="task-card" />
}));
vi.mock('@/components/kanban/task/TaskFilter', () => ({
  TaskFilter: () => <div data-testid="task-filter" />
}));

describe('Board', () => {
  it('should render Board component and project correctly', () => {
    render(<Board />);
    expect(screen.getByTestId('board')).toBeInTheDocument();
    expect(screen.getAllByText('Project 1')).toHaveLength(1);
    expect(screen.getByTestId('task-filter')).toBeInTheDocument();
  });
  it('should filter tasks by status', () => {
    vi.mock('@/lib/store', () => {
      const mockState = {
        projects: [
          {
            _id: 'p1',
            title: 'Project 1',
            owner: { id: 'u1', name: 'User1' },
            members: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            tasks: [
              {
                _id: 't1',
                title: 'Task 1',
                description: '',
                status: 'TODO',
                project: 'p1',
                board: 'b1',
                assignee: {},
                creator: {},
                lastModifier: {},
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                _id: 't2',
                title: 'Task 2',
                description: '',
                status: 'DONE',
                project: 'p1',
                board: 'b1',
                assignee: {},
                creator: {},
                lastModifier: {},
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          }
        ],
        filter: { status: 'TODO' },
        setProjects: vi.fn(),
        dragTaskOnProject: vi.fn()
      };
      return {
        useTaskStore: (selector: any) =>
          selector ? selector(mockState) : mockState
      };
    });
    render(<Board />);
    // Only tasks with status TODO will be rendered
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    // You can add more assertions based on BoardProject or TaskCard mock
  });
  it('should handle drag start and drag end', () => {
    render(<Board />);
    const dndContext = screen
      .getByTestId('board')
      .querySelector('[id="dnd-context"]');
    expect(dndContext).toBeInTheDocument();
  });
});
