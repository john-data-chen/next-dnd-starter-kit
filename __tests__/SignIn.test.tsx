import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Page from '@/app/(auth)/(signin)/page';

describe('SignIn Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('test_signin_page_renders_signin_view_with_Meta', () => {
    render(<Page />);

    expect(document.title).toBe('Next Board');
    expect(document.querySelector('meta[name="description"]')).toHaveProperty(
      'content',
      'A demo project of project management tool'
    );
  });
});
