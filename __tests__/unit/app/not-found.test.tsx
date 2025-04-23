import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NotFoundContent } from '../../../src/app/not-found';

describe('NotFoundContent', () => {
  it('should render the 404 title, message, and buttons correctly', () => {
    render(<NotFoundContent />);
    expect(screen.getByTestId('not-found-container')).toBeInTheDocument();
    expect(screen.getByTestId('not-found-status')).toHaveTextContent('404');
    expect(screen.getByTestId('not-found-title')).toHaveTextContent(/missing/i);
    expect(screen.getByTestId('not-found-message')).toHaveTextContent(
      /doesn't exist/i
    );
    expect(screen.getByTestId('not-found-back-button')).toBeInTheDocument();
    expect(screen.getByTestId('not-found-home-button')).toBeInTheDocument();
  });

  it('should call the corresponding callbacks when Go back and Back to Home buttons are clicked', async () => {
    const onBack = vi.fn();
    const onHome = vi.fn();
    render(<NotFoundContent onBack={onBack} onHome={onHome} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('not-found-back-button'));
    expect(onBack).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId('not-found-home-button'));
    expect(onHome).toHaveBeenCalledTimes(1);
  });
});
