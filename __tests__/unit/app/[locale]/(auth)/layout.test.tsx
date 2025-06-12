import { describe, it, expect } from 'vitest';
import React from 'react';

// Mock Toaster component
vi.mock('@/components/ui/sonner', () => ({
  Toaster: (props: any) => <div data-testid="toaster" {...props} />
}));

import { render, screen } from '@testing-library/react';
import AuthLayout from '@/app/[locale]/(auth)/layout';

describe('AuthLayout', () => {
  it('should render children and Toaster', () => {
    render(
      <AuthLayout>
        <div data-testid="child">Child Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should pass correct props to Toaster', () => {
    render(
      <AuthLayout>
        <div />
      </AuthLayout>
    );
    const toaster = screen.getByTestId('toaster');
    expect(toaster).toHaveAttribute('position', 'bottom-right');
    expect(toaster).toHaveAttribute('visibleToasts', '1');
  });
});