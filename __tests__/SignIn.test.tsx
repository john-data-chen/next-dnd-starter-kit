import SignInPage, { metadata } from '@/app/(auth)/login/page';
import SignInViewPage from '@/components/auth/SignInView';
import UserAuthForm from '@/components/auth/UserAuthForm';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('SignInPage', () => {
  it('renders sign in page', () => {
    render(<SignInPage />);
    const container = screen.getByTestId('signin-page-container');
    expect(container).toBeInTheDocument();
  });

  it('should have correct title', () => {
    expect(metadata.title).toBe('Next Board');
  });

  it('should have correct description', () => {
    expect(metadata.description).toBe(
      'A demo project of project management tool'
    );
  });
});

describe('SignInViewPage', () => {
  test('test_responsive_layout_rendering', () => {
    const { container } = render(<SignInViewPage />);

    expect(container.firstChild).toHaveClass(
      'relative',
      'min-h-screen',
      'flex-col',
      'items-center',
      'justify-center'
    );

    const desktopContainer = screen.getByRole('main');
    expect(desktopContainer).toHaveClass(
      'lg:max-w-none',
      'lg:grid-cols-2',
      'lg:px-0'
    );
  });

  test('test_accessibility_attributes', () => {
    render(<SignInViewPage />);
    const mainContainer = screen.getByRole('main');

    expect(mainContainer).toHaveAttribute('role', 'main');
    expect(mainContainer).toHaveAttribute('aria-label', 'Sign in page');
  });
});

describe('UserAuthForm', () => {
  it('renders form elements', () => {
    render(<UserAuthForm />);

    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    // the test of submit sign in will be tested in playwright
  });
});
