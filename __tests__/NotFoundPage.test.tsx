import { NotFoundContent } from '@/app/not-found';
import { jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

describe('NotFoundContent', () => {
  const mockOnBack = jest.fn();
  const mockOnHome = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('test_not_found_content_renders_correctly', () => {
    render(<NotFoundContent onBack={mockOnBack} onHome={mockOnHome} />);

    expect(screen.getByTestId('not-found-container')).toBeInTheDocument();
    expect(screen.getByTestId('not-found-status')).toHaveTextContent('404');
    expect(screen.getByTestId('not-found-title')).toHaveTextContent(
      "Something's missing"
    );
    expect(screen.getByTestId('not-found-message')).toHaveTextContent(
      "Sorry, the page you are looking for doesn't exist or has been moved."
    );
    expect(screen.getByTestId('not-found-back-button')).toHaveTextContent(
      'Go back'
    );
    expect(screen.getByTestId('not-found-home-button')).toHaveTextContent(
      'Back to Home'
    );
  });

  it('test_not_found_back_button_click', () => {
    render(<NotFoundContent onBack={mockOnBack} onHome={mockOnHome} />);

    fireEvent.click(screen.getByTestId('not-found-back-button'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('test_not_found_home_button_click', () => {
    render(<NotFoundContent onBack={mockOnBack} onHome={mockOnHome} />);

    fireEvent.click(screen.getByTestId('not-found-home-button'));
    expect(mockOnHome).toHaveBeenCalledTimes(1);
  });
});
