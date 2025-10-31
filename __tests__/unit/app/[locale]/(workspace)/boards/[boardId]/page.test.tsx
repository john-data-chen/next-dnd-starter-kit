import BoardPage from '@/app/[locale]/(workspace)/boards/[boardId]/page'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock hooks
const mockUseParams = vi.fn(() => ({ boardId: 'test-board-id' }))

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams()
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Mock store
const setCurrentBoardIdMock = vi.fn()
const fetchProjectsMock = vi.fn()

vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: (state: any) => any) =>
    selector({
      setCurrentBoardId: setCurrentBoardIdMock,
      fetchProjects: fetchProjectsMock
    })
}))

// Mock components
vi.mock('@/components/kanban/board/Board', () => ({
  Board: () => <div data-testid="mock-board">Mock Board</div>
}))

vi.mock('@/components/layout/PageContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-page-container">{children}</div>
}))

// Mock console.error
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('BoardPage', () => {
  beforeEach(() => {
    setCurrentBoardIdMock.mockClear()
    fetchProjectsMock.mockClear()
    consoleErrorSpy.mockClear()
    mockUseParams.mockReturnValue({ boardId: 'test-board-id' })
  })

  it('should render the board and call store actions on mount', () => {
    // Action
    render(<BoardPage />)

    // Assertions
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument()
    expect(screen.getByTestId('mock-board')).toBeInTheDocument()
    expect(setCurrentBoardIdMock).toHaveBeenCalledWith('test-board-id')
    expect(fetchProjectsMock).toHaveBeenCalledWith('test-board-id')
  })

  it('should not call store actions when boardId is undefined', () => {
    // Mock useParams to return undefined boardId
    mockUseParams.mockReturnValue({ boardId: undefined })

    // Action
    render(<BoardPage />)

    // Assertions
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument()
    expect(setCurrentBoardIdMock).not.toHaveBeenCalled()
    expect(fetchProjectsMock).not.toHaveBeenCalled()
  })

  it('should handle errors when fetching projects fails', async () => {
    // Mock fetchProjects to reject
    const testError = new Error('Failed to fetch projects')
    fetchProjectsMock.mockRejectedValueOnce(testError)

    // Action
    render(<BoardPage />)

    // Wait for the error to be logged
    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
