import SignInViewPage from '@/components/auth/SignInView';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';


// Mock the UserAuthForm component
vi.mock('@/components/auth/UserAuthForm', () => ({
  // biome-ignore lint/style/useDefaultExport: <explanation>
  default: () => (
    <div data-testid="mock-user-auth-form">Mock User Auth Form</div>
  )
}));

// Mock the lucide-react Presentation icon
vi.mock('lucide-react', async (importOriginal) => {
  const original = await importOriginal<typeof import('lucide-react')>();
  return {
    ...original,
    Presentation: () => <svg data-testid="mock-presentation-icon" />
  };
});

describe('SignInViewPage Component', () => {
  // ... other test case ...

  it('should render the UserAuthForm component', () => {
    render(<SignInViewPage />);

    // Add screen.debug() here to see the rendered output in the console
    screen.debug();

    // Check if the mocked UserAuthForm is present
    expect(screen.getByTestId('mock-user-auth-form')).toBeInTheDocument(); // This line was failing
    expect(screen.getByText('Mock User Auth Form')).toBeInTheDocument();
  });
});