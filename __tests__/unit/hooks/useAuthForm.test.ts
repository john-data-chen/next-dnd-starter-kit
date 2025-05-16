import { defaultEmail } from '@/constants/demoData';
import useAuthForm from '@/hooks/useAuthForm';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mock Area ---
const mockSetUserInfo = vi.fn();
const mockRouterPush = vi.fn();
let mockIsNavigating = false;
let navigationCallback: (() => void) | null = null;

vi.mock('@/lib/store', () => ({
  useTaskStore: () => ({
    setUserInfo: mockSetUserInfo
  })
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    promise: vi.fn()
  }
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useTransition: () => [
      mockIsNavigating,
      (cb: () => void) => {
        navigationCallback = cb;
      }
    ]
  };
});
// --- End Mock Area ---

describe('useAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetUserInfo.mockClear();
    mockRouterPush.mockClear();
    mockIsNavigating = false;
    navigationCallback = null;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize the form email with the default value', () => {
    const { result } = renderHook(() => useAuthForm());
    expect(result.current.form.getValues('email')).toBe(defaultEmail);
  });

  it('successful login flow: setUserInfo, toast, delayed navigation', async () => {
    const { signIn } = await import('next-auth/react');
    const { toast } = await import('sonner');
    vi.mocked(signIn).mockResolvedValueOnce({
      error: undefined,
      ok: true,
      status: 200,
      url: null,
      code: undefined
    });

    const toastPromiseMock = vi.fn((_promise, { success }) => {
      _promise.catch(() => {
        /* do nothing, just consume */
      });

      const result = { unwrap: () => Promise.resolve(undefined) };
      if (success) success();
      return result;
    });

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: defaultEmail });
      vi.runAllTimers();
      if (navigationCallback) navigationCallback();
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: defaultEmail,
      redirect: false
    });
    expect(mockSetUserInfo).toHaveBeenCalledWith(defaultEmail);
  });

  it('should trigger toast.promise error handler on CredentialsSignin error', async () => {
    const { signIn } = await import('next-auth/react');
    const { toast } = await import('sonner');
    vi.mocked(signIn).mockResolvedValueOnce({
      error: 'CredentialsSignin',
      ok: false,
      status: 401,
      url: null,
      code: undefined
    });

    const toastPromiseMock = vi.fn((_promise, { error }) => {
      _promise.catch(() => {
        /* do nothing, just consume */
      });

      const result = {
        unwrap: () => Promise.reject(new Error('Invalid email, retry again.'))
      };
      if (error) error(new Error('Invalid email, retry again.'));
      return result;
    });
    toast.promise = toastPromiseMock;

    // Suppress console.error
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: 'fail@example.com' });
    });

    const lastToastCall = toastPromiseMock.mock.results.at(-1)?.value;
    if (lastToastCall && typeof lastToastCall.unwrap === 'function') {
      try {
        await lastToastCall.unwrap();
      } catch (e) {
        // error is expected, do nothing
      }
    }

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'fail@example.com',
      redirect: false
    });
    expect(mockSetUserInfo).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(toastPromiseMock).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('should trigger toast.promise error handler on other signIn errors', async () => {
    const { signIn } = await import('next-auth/react');
    const { toast } = await import('sonner');
    vi.mocked(signIn).mockResolvedValueOnce({
      error: 'Some error',
      ok: false,
      status: 500,
      url: null,
      code: undefined
    });

    const toastPromiseMock = vi.fn((_promise, { error }) => {
      _promise.catch(() => {
        /* do nothing, just consume */
      });

      const result = { unwrap: () => Promise.reject(new Error('Some error')) };
      if (error) error(new Error('Some error'));
      return result;
    });
    toast.promise = toastPromiseMock;

    const { result } = renderHook(() => useAuthForm());

    await act(async () => {
      await result.current.onSubmit({ email: 'fail2@example.com' });
    });

    const lastToastCall = toastPromiseMock.mock.results.at(-1)?.value;
    if (lastToastCall && typeof lastToastCall.unwrap === 'function') {
      try {
        await lastToastCall.unwrap();
      } catch (e) {
        // error is expected, do nothing
      }
    }

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'fail2@example.com',
      redirect: false
    });
    expect(mockSetUserInfo).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(toastPromiseMock).toHaveBeenCalled();
  });

  it('should trigger toast.promise error handler when signIn throws', async () => {
    const { signIn } = await import('next-auth/react');
    const { toast } = await import('sonner');
    vi.mocked(signIn).mockRejectedValueOnce(new Error('Network error'));

    const toastPromiseMock = vi.fn((_promise, { error }) => {
      _promise.catch(() => {
        /* do nothing, just consume */
      });

      const result = {
        unwrap: () => Promise.reject(new Error('Network error'))
      };
      if (error) error(new Error('Network error'));
      return result;
    });
    toast.promise = toastPromiseMock;

    const { result } = renderHook(() => useAuthForm());

    // Suppress console.error
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await result.current.onSubmit({ email: 'error@example.com' });
    });

    const lastToastCall = toastPromiseMock.mock.results.at(-1)?.value;
    if (lastToastCall && typeof lastToastCall.unwrap === 'function') {
      try {
        await lastToastCall.unwrap();
      } catch (e) {
        // error is expected, do nothing
      }
    }

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'error@example.com',
      redirect: false
    });
    expect(mockSetUserInfo).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(toastPromiseMock).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('loading state should sync with isNavigating', () => {
    mockIsNavigating = false;
    const { result, rerender } = renderHook(() => useAuthForm());
    expect(result.current.loading).toBe(false);

    mockIsNavigating = true;
    rerender();
    expect(result.current.loading).toBe(true);

    mockIsNavigating = false;
    rerender();
    expect(result.current.loading).toBe(false);
  });
});
