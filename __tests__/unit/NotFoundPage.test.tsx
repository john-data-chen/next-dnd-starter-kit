import NotFound from '@/app/not-found';
import { render, screen } from '@testing-library/react';

describe('NotFound Page', () => {
  it('renders 404 page correctly', () => {
    render(<NotFound />);
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "Sorry, the page you are looking for doesn't exist or has been moved."
      )
    ).toBeInTheDocument();
  });
});
