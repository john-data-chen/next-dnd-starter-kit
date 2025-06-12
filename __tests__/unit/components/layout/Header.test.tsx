import Header from '@/components/layout/Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { usePathname } from '@/i18n/navigation';
import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test-utils';

// Mock child components and hooks
vi.mock('@/i18n/navigation', () => ({
  usePathname: vi.fn()
}));
vi.mock('next-auth/react');
vi.mock('@/components/Breadcrumbs', () => ({
  __esModule: true,
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}));
vi.mock('@/components/layout/UserNav', () => ({
  __esModule: true,
  UserNav: () => <div data-testid="user-nav">UserNav</div>
}));
vi.mock('@/components/layout/ThemeToggle', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-toggle">ThemeToggle</div>
}));
vi.mock('@/components/layout/LanguageSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>
}));

describe('Header Component', () => {
  it('should render all child components correctly', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: 'Test User' } } as Session,
      status: 'authenticated',
      update: vi.fn()
    });
    vi.mocked(usePathname).mockReturnValue('/some/path');

    render(
      <SidebarProvider>
        <Header />
      </SidebarProvider>
    );

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByTestId('user-nav')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });
});
