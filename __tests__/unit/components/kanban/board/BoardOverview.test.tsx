import { BoardOverview } from '@/components/kanban/BoardOverview';
import { useBoards } from '@/hooks/useBoards';
import { Board } from '@/types/dbInterface';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname, useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocking Dependencies ---

// Mock useBoards hook
vi.mock('@/hooks/useBoards');
// Cast using the imported vi object if needed, though MockedFunction might work globally now
const mockUseBoards = useBoards as ReturnType<typeof vi.fn>; // Alternative casting if MockedFunction fails

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
    toString: vi.fn(() => '')
  }))
}));
const mockUseRouter = useRouter as ReturnType<typeof vi.fn>; // Alternative casting
const mockUsePathname = usePathname as ReturnType<typeof vi.fn>; // Alternative casting

// Mock child components
vi.mock('@/components/kanban/board/BoardActions', () => ({
  // Adjusted path based on potential location
  BoardActions: vi.fn(({ board }) => (
    <div data-testid={`board-actions-${board._id}`}>Actions</div>
  ))
}));
vi.mock('@/components/kanban/board/NewBoardDialog', () => ({
  // Adjusted path based on potential location
  default: vi.fn(({ children }) => (
    <div data-testid="new-board-dialog">
      <div>
        <button data-testid="cancel-button">Cancel</button>
        <button data-testid="create-button">Create</button>
      </div>
      {children}
    </div>
  ))
}));

// Mock Shadcn Select components
let capturedOnValueChange: ((value: string) => void) | undefined;
vi.mock('@/components/ui/select', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/components/ui/select')>();
  return {
    ...original, // Keep other exports
    Select: vi.fn(({ children, onValueChange, value }) => {
      capturedOnValueChange = onValueChange; // Capture the callback
      // Render children to include trigger etc.
      return (
        <div data-testid="mock-select" data-current-value={value}>
          {children}
        </div>
      );
    }),
    SelectTrigger: vi.fn(({ children, ...props }) => (
      <button {...props} role="combobox">
        {children}
      </button>
    )),
    SelectContent: vi.fn(({ children }) => (
      <div data-testid="mock-select-content">{children}</div>
    )),
    SelectItem: vi.fn(({ children, value, ...props }) => (
      <div
        data-testid={`mock-select-item-${value}`}
        data-value={value}
        {...props}
      >
        {children}
      </div>
    )),
    SelectValue: vi.fn((props) => (
      <span data-testid="mock-select-value">{props.placeholder}</span>
    ))
  };
});

// --- Test Data ---
const mockMyBoard1: Board = {
  _id: 'my1',
  title: 'My Personal Board',
  description: 'My description',
  owner: { id: 'user1', name: 'Me' },
  members: [{ id: 'user1', name: 'Me' }],
  projects: [{ id: 'p1', title: 'Project Alpha' }],
  createdAt: new Date(),
  updatedAt: new Date()
};
const mockMyBoard2: Board = {
  _id: 'my2',
  title: 'My Secret Project',
  description: '',
  owner: { id: 'user1', name: 'Me' },
  members: [{ id: 'user1', name: 'Me' }],
  projects: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
const mockTeamBoard1: Board = {
  _id: 'team1',
  title: 'Team Shared Board',
  description: 'Team description',
  owner: { id: 'user2', name: 'Alice' },
  members: [
    { id: 'user1', name: 'Me' },
    { id: 'user2', name: 'Alice' }
  ],
  projects: [{ id: 'p2', title: 'Project Beta' }],
  createdAt: new Date(),
  updatedAt: new Date()
};

// --- Test Suite ---

describe('BoardOverview Component', () => {
  let mockRouterPush: ReturnType<typeof vi.fn>; // Use imported vi for type

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    capturedOnValueChange = undefined; // Reset captured function

    // Setup default mock implementations
    mockRouterPush = vi.fn();
    // Ensure mocks are correctly typed if using alternative casting above
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockRouterPush
    });
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/boards');
    (useBoards as ReturnType<typeof vi.fn>).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      fetchBoards: vi.fn()
    });
  });

  it('should display loading state', () => {
    mockUseBoards.mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: true,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display "No boards found" messages when there are no boards', () => {
    render(<BoardOverview />);
    // Check for "My Boards" section message using data-testid for the title
    expect(screen.getByTestId('myBoardsTitle')).toBeInTheDocument(); // Use test ID here
    expect(screen.getAllByText('No boards found.')[0]).toBeInTheDocument();
    // Check for "Team Boards" section message using data-testid for the title
    expect(screen.getByTestId('teamBoardsTitle')).toBeInTheDocument(); // Use test ID here
    expect(screen.getAllByText('No team boards found.')[0]).toBeInTheDocument(); // Adjusted query
  });

  it('should render My Boards and Team Boards correctly', () => {
    mockUseBoards.mockReturnValue({
      myBoards: [mockMyBoard1],
      teamBoards: [mockTeamBoard1],
      loading: false,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);

    // Check My Boards using data-testid for the title
    expect(screen.getByTestId('myBoardsTitle')).toBeInTheDocument(); // Use test ID here
    expect(screen.getByText(mockMyBoard1.title)).toBeInTheDocument();
    expect(screen.getByText(mockMyBoard1.description!)).toBeInTheDocument();
    expect(
      screen.getByTestId(`board-actions-${mockMyBoard1._id}`)
    ).toBeInTheDocument(); // Check if actions are rendered

    // Check Team Boards using data-testid for the title
    expect(screen.getByTestId('teamBoardsTitle')).toBeInTheDocument(); // Use test ID here
    expect(screen.getByText(mockTeamBoard1.title)).toBeInTheDocument();
    expect(screen.getByText(mockTeamBoard1.description!)).toBeInTheDocument();
    expect(
      screen.getByText(`Owner: ${mockTeamBoard1.owner.name}`)
    ).toBeInTheDocument();
    // Team boards shouldn't have BoardActions in this setup
    expect(
      screen.queryByTestId(`board-actions-${mockTeamBoard1._id}`)
    ).not.toBeInTheDocument();
  });

  it('should filter boards based on search input', async () => {
    const user = userEvent.setup();
    mockUseBoards.mockReturnValue({
      myBoards: [mockMyBoard1, mockMyBoard2],
      teamBoards: [mockTeamBoard1],
      loading: false,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);

    const searchInput = screen.getByPlaceholderText('Search boards...');
    await user.type(searchInput, 'Personal');

    // Should only show mockMyBoard1
    expect(screen.getByText(mockMyBoard1.title)).toBeInTheDocument();
    expect(screen.queryByText(mockMyBoard2.title)).not.toBeInTheDocument();
    expect(screen.queryByText(mockTeamBoard1.title)).not.toBeInTheDocument(); // Team board shouldn't match

    await user.clear(searchInput);
    await user.type(searchInput, 'Shared');

    // Should only show mockTeamBoard1
    expect(screen.queryByText(mockMyBoard1.title)).not.toBeInTheDocument();
    expect(screen.queryByText(mockMyBoard2.title)).not.toBeInTheDocument();
    expect(screen.getByText(mockTeamBoard1.title)).toBeInTheDocument();
  });

  it('should call router.push when a board card is clicked', async () => {
    const user = userEvent.setup();
    mockUseBoards.mockReturnValue({
      myBoards: [mockMyBoard1],
      teamBoards: [mockTeamBoard1],
      loading: false,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);

    const myBoardCard = screen
      .getByText(mockMyBoard1.title)
      .closest('.cursor-pointer');
    const teamBoardCard = screen
      .getByText(mockTeamBoard1.title)
      .closest('.cursor-pointer');

    expect(myBoardCard).toBeInTheDocument();
    expect(teamBoardCard).toBeInTheDocument();

    if (myBoardCard) {
      await user.click(myBoardCard);
      expect(mockRouterPush).toHaveBeenCalledWith(
        `/boards/${mockMyBoard1._id}`
      );
    }

    if (teamBoardCard) {
      await user.click(teamBoardCard);
      expect(mockRouterPush).toHaveBeenCalledWith(
        `/boards/${mockTeamBoard1._id}`
      );
    }

    expect(mockRouterPush).toHaveBeenCalledTimes(2);
  });

  it('should render the New Board button/dialog trigger', () => {
    render(<BoardOverview />);
    expect(screen.getByTestId('new-board-dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'New Board' })
    ).toBeInTheDocument();
  });

  it('should call fetchBoards on initial render and visibility change', () => {
    const mockFetchBoards = vi.fn();
    mockUseBoards.mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      fetchBoards: mockFetchBoards
    });

    // Mock document visibility API
    const originalVisibilityState = document.visibilityState;
    let visibilityState: DocumentVisibilityState = 'visible';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: function () {
        return visibilityState;
      }
    });
    const listeners: Record<string, EventListener> = {};
    const originalAddEventListener = document.addEventListener;
    const originalRemoveEventListener = document.removeEventListener;
    document.addEventListener = vi.fn((event, cb) => {
      if (event === 'visibilitychange' && typeof cb === 'function') {
        listeners[event] = cb;
      } else {
        originalAddEventListener.call(document, event, cb);
      }
    });
    document.removeEventListener = vi.fn((event, cb) => {
      if (event === 'visibilitychange' && listeners[event] === cb) {
        delete listeners[event];
      } else {
        originalRemoveEventListener.call(document, event, cb);
      }
    });

    const { unmount } = render(<BoardOverview />);

    // Check initial fetch call (due to useEffect in useBoards and BoardOverview)
    // Note: The exact number might depend on strict mode and hook implementation details.
    // We focus on it being called at least once initially.
    expect(mockFetchBoards).toHaveBeenCalled();
    const initialCallCount = mockFetchBoards.mock.calls.length;

    // Simulate visibility change to hidden and back to visible
    visibilityState = 'hidden';
    if (listeners['visibilitychange'])
      listeners['visibilitychange'](new Event('visibilitychange'));
    expect(mockFetchBoards).toHaveBeenCalledTimes(initialCallCount); // Should not fetch when hidden

    visibilityState = 'visible';
    if (listeners['visibilitychange'])
      listeners['visibilitychange'](new Event('visibilitychange'));
    expect(mockFetchBoards).toHaveBeenCalledTimes(initialCallCount + 1); // Should fetch when visible again

    // Cleanup listener on unmount
    unmount();
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );

    // Restore original document properties
    Object.defineProperty(document, 'visibilityState', {
      value: originalVisibilityState,
      writable: true // Make it writable again if needed
    });
    document.addEventListener = originalAddEventListener;
    document.removeEventListener = originalRemoveEventListener;
  });

  it('should filter boards based on the filter select', async () => {
    const user = userEvent.setup();
    mockUseBoards.mockReturnValue({
      myBoards: [mockMyBoard1],
      teamBoards: [mockTeamBoard1],
      loading: false,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);

    // Use the new data-testid to find the trigger
    const filterSelectTrigger = screen.getByTestId('select-filter-trigger');

    // Initial state (All) - Check board visibility using test IDs for titles and text for cards
    expect(screen.getByTestId('myBoardsTitle')).toBeInTheDocument(); // Use test ID for My Boards title
    expect(screen.getByText(mockMyBoard1.title)).toBeInTheDocument();
    expect(screen.getByTestId('teamBoardsTitle')).toBeInTheDocument(); // Use test ID for Team Boards title
    expect(screen.getByText(mockTeamBoard1.title)).toBeInTheDocument();

    // --- Simulate selecting "My Boards" ---
    await user.click(filterSelectTrigger);
    const myBoardsOption = await screen.findByTestId('selectMyBoards');
    await user.click(myBoardsOption);

    // Assertions after filtering for "My Boards"
    expect(screen.getByTestId('myBoardsTitle')).toBeInTheDocument(); // Check My Boards title by test ID
    expect(screen.getByText(mockMyBoard1.title)).toBeInTheDocument();

    // --- Simulate selecting "Team Boards" ---
    await user.click(filterSelectTrigger);
    const teamBoardsOption = await screen.findByTestId('selectTeamBoards');
    await user.click(teamBoardsOption);

    // Assertions after filtering for "Team Boards"
    expect(screen.getByTestId('teamBoardsTitle')).toBeInTheDocument(); // Check Team Boards title by test ID
    expect(screen.getByText(mockTeamBoard1.title)).toBeInTheDocument();

    // --- Simulate selecting "All Boards" again ---
    await user.click(filterSelectTrigger); // Use the variable holding the trigger element
    const allBoardsOption = await screen.findByTestId('selectAllBoards');
    await user.click(allBoardsOption);

    // Assertions after filtering for "All Boards"
    expect(screen.getByTestId('myBoardsTitle')).toBeInTheDocument(); // Check My Boards title by test ID
    expect(screen.getByText(mockMyBoard1.title)).toBeInTheDocument();
    expect(screen.getByTestId('teamBoardsTitle')).toBeInTheDocument(); // Check Team Boards title by test ID
    expect(screen.getByText(mockTeamBoard1.title)).toBeInTheDocument();
  });
});
