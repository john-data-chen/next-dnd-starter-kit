import AppSidebar from '@/components/layout/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useBoards } from '@/hooks/useBoards';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn()
}));

// Mock useBoards hook
vi.mock('@/hooks/useBoards', () => ({
  useBoards: vi.fn()
}));

// Mock projectInfo
vi.mock('@/constants/sidebar', () => ({
  projectInfo: {
    name: 'Test Project'
  }
}));

describe('AppSidebar Component', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<SidebarProvider>{ui}</SidebarProvider>);
  };

  it('should render project name correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should highlight overview link when on boards page', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />);

    const overviewLink = screen.getByRole('link', { name: /overview/i });
    // Check for the data-active attribute instead of the class directly
    expect(overviewLink).toHaveAttribute('data-active', 'true'); // Changed assertion
  });

  it('should render loading state correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: true,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />); // Changed from render()

    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements).toHaveLength(2); // Expecting loading in both "My Boards" and "Team Boards"
  });

  it('should render my boards correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [
        {
          _id: '1',
          title: 'Board 1',
          owner: { id: 'user1', name: 'Test User' },
          members: [],
          projects: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          title: 'Board 2',
          owner: { id: 'user1', name: 'Test User' },
          members: [],
          projects: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />); // Changed from render()

    expect(screen.getByText('Board 1')).toBeInTheDocument();
    expect(screen.getByText('Board 2')).toBeInTheDocument();
  });

  it('should render team boards correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/boards');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [
        {
          _id: '3',
          title: 'Team Board 1',
          owner: { id: 'user1', name: 'Test User' },
          members: [],
          projects: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '4',
          title: 'Team Board 2',
          owner: { id: 'user1', name: 'Test User' },
          members: [],
          projects: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />); // Changed from render()

    expect(screen.getByText('Team Board 1')).toBeInTheDocument();
    expect(screen.getByText('Team Board 2')).toBeInTheDocument();
  });

  it('should highlight active board link', () => {
    vi.mocked(usePathname).mockReturnValue('/boards/1');
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [
        {
          _id: '1',
          title: 'Board 1',
          owner: { id: 'user1', name: 'Test User' },
          members: [],
          projects: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      teamBoards: [],
      loading: false,
      fetchBoards: async () => {}
    });

    renderWithProvider(<AppSidebar />); // Changed from render()

    const boardLink = screen.getByRole('link', { name: 'Board 1' });
    // Also update this test case to check the data-active attribute
    expect(boardLink).toHaveAttribute('data-active', 'true'); // Changed assertion
  });
});
