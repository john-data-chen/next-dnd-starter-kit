import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    AUTH: { LOGIN: '/login' },
    BOARDS: { ROOT: '/boards' }
  }
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

import RootPage from '@/app/[locale]/page';

describe('RootPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login if not authenticated', async () => {
    ((await import('@/lib/auth')).auth as Mock).mockResolvedValueOnce(null);
    await RootPage();
    expect((await import('next/navigation')).redirect).toHaveBeenCalledWith('/login');
  });

  it('should redirect to boards if authenticated', async () => {
    ((await import('@/lib/auth')).auth as Mock).mockResolvedValueOnce({ user: { name: 'Test' } });
    await RootPage();
    expect((await import('next/navigation')).redirect).toHaveBeenCalledWith('/boards');
  });
});
