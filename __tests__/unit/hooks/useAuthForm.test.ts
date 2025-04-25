import { defaultEmail } from '@/constants/demoData';
import useAuthForm from '@/hooks/useAuthForm';
import { useTaskStore } from '@/lib/store';
import { act, renderHook } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    promise: vi.fn()
  }
}));

// Mock zustand store
vi.mock('@/lib/store', () => ({
  useTaskStore: vi.fn(() => ({
    setUserInfo: vi.fn()
  }))
}));

describe('useAuthForm Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Instead of deleting, reassign the location object
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  it('should initialize form with default email', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.form.getValues('email')).toBe(defaultEmail);
  });

  it('should handle successful sign in', async () => {
    // Create a mock for setUserInfo
    const mockSetUserInfo = vi.fn();
    vi.mocked(useTaskStore).mockReturnValue({
      setUserInfo: mockSetUserInfo
    });

    // Mock successful sign in
    vi.mocked(signIn).mockResolvedValueOnce({
      error: undefined,
      ok: true,
      status: 200,
      code: undefined,
      url: null
    });

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: defaultEmail });
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: defaultEmail,
      redirect: false
    });
    expect(toast.promise).toHaveBeenCalled();
    expect(mockSetUserInfo).toHaveBeenCalledWith(defaultEmail);
  });

  it('should handle sign in error from next-auth', async () => {
    vi.mocked(signIn).mockResolvedValueOnce({
      error: 'Invalid email',
      status: 401,
      code: undefined,
      ok: false,
      url: null
    });

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: 'invalid@example.com' });
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'invalid@example.com',
      redirect: false
    });
    expect(toast.error).toHaveBeenCalledWith('Invalid email, retry again.');
  });

  it('should handle system error', async () => {
    vi.mocked(signIn).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: 'test@example.com' });
    });

    expect(toast.error).toHaveBeenCalledWith(
      'System error. Please try again later.'
    );
  });
});
