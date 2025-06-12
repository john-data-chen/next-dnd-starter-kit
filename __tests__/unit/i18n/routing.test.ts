import { describe, it, expect, vi } from 'vitest';

// Mock next-intl/routing
vi.mock('next-intl/routing', () => ({
  defineRouting: vi.fn((config) => config)
}));

import { routing } from '@/i18n/routing';

describe('routing', () => {
  it('should define supported locales', () => {
    expect(routing.locales).toEqual(['en', 'de']);
  });

  it('should define defaultLocale as en', () => {
    expect(routing.defaultLocale).toBe('en');
  });
});