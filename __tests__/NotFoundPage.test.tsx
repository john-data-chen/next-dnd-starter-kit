import { render, screen, fireEvent } from '@testing-library/react';
import { NotFoundContent } from '@/app/not-found';
import { jest } from '@jest/globals';

describe('NotFoundContent', () => {
  it('renders all elements correctly', () => {
    render(<NotFoundContent />);

    expect(screen.getByTestId('not-found-status')).toHaveTextContent('404');
    expect(screen.getByTestId('not-found-title')).toHaveTextContent(
      "Something's missing"
    );
    expect(screen.getByTestId('not-found-message')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const mockOnBack = jest.fn();
    render(<NotFoundContent onBack={mockOnBack} />);

    fireEvent.click(screen.getByTestId('not-found-back-button'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('calls onHome when home button is clicked', () => {
    const mockOnHome = jest.fn();
    render(<NotFoundContent onHome={mockOnHome} />);

    fireEvent.click(screen.getByTestId('not-found-home-button'));
    expect(mockOnHome).toHaveBeenCalled();
  });
});
