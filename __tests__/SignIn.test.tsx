import { render } from '@testing-library/react';
import Page from '@/app/(auth)/(signin)/page';
import SignInViewPage from '@/components/auth/SignInView';

jest.mock('@/components/auth/SignInView');

describe('SignIn Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('test_signin_page_renders_signin_view', () => {
    render(<Page />);
    expect(SignInViewPage).toHaveBeenCalled();
  });

  it('test_signin_page_handles_component_error', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (SignInViewPage as jest.Mock).mockImplementation(() => {
      throw new Error('Component failed to load');
    });

    expect(() => render(<Page />)).not.toThrow();

    consoleError.mockRestore();
  });
});
