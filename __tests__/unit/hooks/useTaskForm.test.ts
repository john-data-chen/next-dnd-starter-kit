import { useTaskForm } from '@/hooks/useTaskForm';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}));

describe('useTaskForm Hook', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useTaskForm({ onSubmit: mockOnSubmit })
    );

    expect(result.current.form.getValues()).toEqual({
      title: '',
      description: '',
      status: 'TODO',
      dueDate: undefined,
      assignee: undefined
    });
  });

  it('should initialize with custom values', () => {
    const defaultValues = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'IN_PROGRESS' as const,
      dueDate: new Date('2024-01-01'),
      assignee: { id: 'user1', name: 'User One' }
    };

    const { result } = renderHook(() =>
      useTaskForm({ defaultValues, onSubmit: mockOnSubmit })
    );

    expect(result.current.form.getValues()).toEqual(defaultValues);
  });

  it('should handle user search', async () => {
    vi.useFakeTimers();

    // Mock fetch with more complete response
    vi.mocked(global.fetch).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ users: [] })
      } as Response)
    );

    const { result } = renderHook(() =>
      useTaskForm({ onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.setAssignOpen(true);
      result.current.setSearchQuery('test');
    });

    // Fast-forward timers and handle all promises
    await act(async () => {
      vi.advanceTimersByTime(300);
      // Wait for the fetch to be initiated
      await Promise.resolve();
      // Wait for the fetch to complete
      await Promise.resolve();
      // Wait for the state update
      await Promise.resolve();
      // One more tick for good measure
      await Promise.resolve();
    });

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/users/search?username=test'
    );

    // Verify state update
    expect(result.current.users).toEqual([]);

    vi.useRealTimers();
  });

  it('should handle search error gracefully', async () => {
    vi.useFakeTimers();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() =>
      useTaskForm({ onSubmit: mockOnSubmit })
    );

    act(() => {
      result.current.setAssignOpen(true);
      result.current.setSearchQuery('test');
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error searching users:',
      expect.any(Error)
    );
    expect(result.current.users).toEqual([]);

    consoleSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should handle form submission successfully', async () => {
    const { result } = renderHook(() =>
      useTaskForm({ onSubmit: mockOnSubmit })
    );

    const submitData = {
      title: 'New Task',
      description: 'Task Description',
      status: 'TODO' as const,
      assignee: { id: 'user1', name: 'User One' }
    };

    await act(async () => {
      await result.current.handleSubmit(submitData);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(submitData);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle form submission error', async () => {
    const error = new Error('Submit Error');
    mockOnSubmit.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useTaskForm({ onSubmit: mockOnSubmit })
    );

    const submitData = {
      title: 'New Task',
      description: 'Task Description',
      status: 'TODO' as const
    };

    await act(async () => {
      await result.current.handleSubmit(submitData);
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('should debounce search queries', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useTaskForm({ onSubmit: mockOnSubmit })
    );

    // Mock fetch responses
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      } as Response);

    // First API call when opening assign user panel
    act(() => {
      result.current.setAssignOpen(true);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Reset mock to check debounce behavior
    vi.mocked(global.fetch).mockReset();

    // Multiple search queries in quick succession
    act(() => {
      result.current.setSearchQuery('test1');
      result.current.setSearchQuery('test2');
      result.current.setSearchQuery('test3');
    });

    // Fast-forward to complete the debounce timeout
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    // Should only make one API call with the last search value
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/users/search?username=test3'
    );

    vi.useRealTimers();
  });
});
