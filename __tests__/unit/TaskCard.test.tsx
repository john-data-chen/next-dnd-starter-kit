import { TaskCard } from '@/components/kanban/task/TaskCard';
import { Task, TaskStatus } from '@/types/dbInterface';
import { render, screen } from '@testing-library/react';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    _id: '1',
    title: 'Test Task',
    description: 'This is a test task',
    status: TaskStatus.TODO, // Use the enum value here
    dueDate: new Date('2025-04-28'),
    creator: { id: 'creator-id', name: 'Creator Name' },
    lastModifier: { id: 'modifier-id', name: 'Modifier Name' },
    assignee: { id: 'assignee-id', name: 'Assignee Name' },
    board: 'board-id',
    project: 'project-id',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders task status', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders task creator', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Created by: Creator Name')).toBeInTheDocument();
  });

  it('renders task last modifier', () => {
    render(<TaskCard task={mockTask} />);
    expect(
      screen.getByText('Last Modified by: Modifier Name')
    ).toBeInTheDocument();
  });

  it('renders task assignee', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Assignee: Assignee Name')).toBeInTheDocument();
  });

  it('renders task due date', () => {
    render(<TaskCard task={mockTask} />);
    const formattedDate = '2025/04/28';
    expect(screen.getByText(`Due Date: ${formattedDate}`)).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
  });
});
