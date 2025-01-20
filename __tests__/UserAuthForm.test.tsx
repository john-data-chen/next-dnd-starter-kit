import { render, screen } from '@testing-library/react';
import UserAuthForm from '@/components/auth/UserAuthForm';

describe('UserAuthForm', () => {
  it('renders form elements', () => {
    render(<UserAuthForm />);

    expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });
});
