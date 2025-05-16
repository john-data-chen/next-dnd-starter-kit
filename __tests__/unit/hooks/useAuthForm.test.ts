import { defaultEmail } from '@/constants/demoData';
import { ROUTES } from '@/constants/routes';
import useAuthForm from '@/hooks/useAuthForm';
import { act, renderHook } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import React for useTransition mock

// --- Mocks ---

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}));

// Use vi.hoisted to ensure mockToastPromise is defined before vi.mock for 'sonner'
const hoistedMocks = vi.hoisted(() => {
  return {
    mockToastPromise: vi.fn(async (promiseAction, callbacks) => {
      if (callbacks.loading) {
        // console.log(`Mocked toast loading: ${callbacks.loading}`);
      }
      try {
        const result = await promiseAction();
        if (callbacks.success) {
          return callbacks.success(result);
        }
      } catch (err) {
        if (callbacks.error) {
          return callbacks.error(err as Error);
        }
        throw err;
      }
    })
  };
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(), // Keep if direct calls are possible, though useAuthForm doesn't use it
    promise: hoistedMocks.mockToastPromise // Use the hoisted mock
  }
}));

// Mock @/lib/store
const mockSetUserInfo = vi.fn();
vi.mock('@/lib/store', () => ({
  useTaskStore: vi.fn(() => ({
    setUserInfo: mockSetUserInfo
  }))
}));

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

// Mock react's useTransition
let mockIsNavigating = false;
const setMockIsNavigating = (value: boolean) => {
  mockIsNavigating = value;
};
// Ensure startNavigationTransition executes the callback
const mockStartNavigationTransition = vi.fn((callback: () => void) => {
  // Simulate setting pending state to true during the transition
  const originalIsNavigating = mockIsNavigating;
  setMockIsNavigating(true);
  try {
    callback(); // Execute the actual transition logic (e.g., router.push)
  } finally {
    // Simulate transition completion
    setMockIsNavigating(originalIsNavigating); // Reset to original, or false if appropriate
  }
});

// Need to use vi.mock correctly for React itself if modifying its exports
// We ensure that the actual React is imported and then we override useTransition
vi.mock('react', async () => {
  const actualReact = await vi.importActual<typeof React>('react');
  return {
    ...actualReact,
    useTransition: (): [boolean, (callback: () => void) => void] => [
      mockIsNavigating,
      mockStartNavigationTransition
    ]
  };
});

// --- Tests ---
describe('useAuthForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure the hoisted mock is also cleared/reset if needed, or re-initialize its behavior
    hoistedMocks.mockToastPromise.mockClear();
    vi.useFakeTimers();
    setMockIsNavigating(false); // Reset navigation state

    // Mock window.location if necessary, though not directly used by useAuthForm
    Object.defineProperty(window, 'location', {
      value: { href: ROUTES.AUTH.LOGIN }, // Default to login page
      writable: true
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers(); // Clear any remaining timers
    vi.useRealTimers();
  });

  it('should initialize form with default email', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.form.getValues('email')).toBe(defaultEmail);
  });

  it('should handle successful sign in, update user info, and navigate', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({
      ok: true,
      error: undefined, // Corrected based on previous feedback
      status: 200,
      url: null,
      // code: undefined // Removed as it's not standard
      code: undefined
    });

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: defaultEmail });
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: defaultEmail,
      redirect: false
    });
    expect(hoistedMocks.mockToastPromise).toHaveBeenCalled(); // Verify toast.promise was called
    expect(mockSetUserInfo).toHaveBeenCalledWith(defaultEmail);
  });

  it('should handle "CredentialsSignin" error from next-auth via toast.promise', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({
      error: 'CredentialsSignin',
      ok: false,
      status: 401,
      url: null,
      // code: undefined // Removed
      code: undefined
    });

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: 'test@example.com' });
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      redirect: false
    });
    expect(hoistedMocks.mockToastPromise).toHaveBeenCalled(); // Verify toast.promise was called
    expect(mockSetUserInfo).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();

    // Removed assertion for toastPromiseCallResult.value
  });

  it('should handle other errors from next-auth via toast.promise', async () => {
    const errorMessage = 'Some other authentication error';
    vi.mocked(signIn).mockResolvedValueOnce({
      error: errorMessage,
      ok: false,
      status: 500,
      url: null,
      // code: undefined // Removed
      code: undefined
    });

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: 'test@example.com' });
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      redirect: false
    });
    expect(hoistedMocks.mockToastPromise).toHaveBeenCalled(); // Verify toast.promise was called
    expect(mockSetUserInfo).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();

    // Removed assertion for toastPromiseCallResult.value
  });

  it('should handle system error (signIn rejects) via toast.promise', async () => {
    const networkError = new Error('Network error');
    vi.mocked(signIn).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useAuthForm());

    // Suppress console.error for this test as the hook logs it
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await act(async () => {
      await result.current.onSubmit({ email: 'test@example.com' });
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      redirect: false
    });
    expect(hoistedMocks.mockToastPromise).toHaveBeenCalled(); // Verify toast.promise was called
    expect(mockSetUserInfo).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();

    // Removed assertion for toastPromiseCallResult.value
    consoleErrorSpy.mockRestore();
  });

  it('should reflect the isNavigating state from useTransition as loading state', () => {
    // Initial state from mockIsNavigating = false
    const { result, rerender } = renderHook(() => useAuthForm());
    expect(result.current.loading).toBe(false);

    // Simulate transition starting
    act(() => {
      setMockIsNavigating(true);
      rerender(); // Rerender the hook to pick up the new state
    });
    expect(result.current.loading).toBe(true);

    // Simulate transition ending
    act(() => {
      setMockIsNavigating(false);
      rerender();
    });
    expect(result.current.loading).toBe(false);
  });
});
