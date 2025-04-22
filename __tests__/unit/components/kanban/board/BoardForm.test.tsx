import { BoardForm } from '@/components/kanban/board/BoardForm';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Helper function to wrap BoardForm with a submit button for testing
const renderBoardForm = (props: React.ComponentProps<typeof BoardForm>) => {
  return render(
    <BoardForm {...props}>
      <button type="submit">Submit</button>
    </BoardForm>
  );
};

describe('BoardForm', () => {
  it('should render the form with empty fields by default', () => {
    const handleSubmit = vi.fn();
    renderBoardForm({ onSubmit: handleSubmit });

    expect(screen.getByLabelText('Board Title')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });

  it('should render the form with default values', () => {
    const handleSubmit = vi.fn();
    const defaultValues = {
      title: 'Default Title',
      description: 'Default Desc'
    };
    renderBoardForm({ onSubmit: handleSubmit, defaultValues });

    expect(screen.getByLabelText('Board Title')).toHaveValue('Default Title');
    expect(screen.getByLabelText('Description')).toHaveValue('Default Desc');
  });

  it('should allow typing into fields', () => {
    const handleSubmit = vi.fn();
    renderBoardForm({ onSubmit: handleSubmit });

    const titleInput = screen.getByLabelText('Board Title');
    const descriptionInput = screen.getByLabelText('Description');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Desc' } });

    expect(titleInput).toHaveValue('New Title');
    expect(descriptionInput).toHaveValue('New Desc');
  });

  it('should call onSubmit with form values when submitted successfully', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined); // Mock async submit
    renderBoardForm({ onSubmit: handleSubmit });

    const titleInput = screen.getByLabelText('Board Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Valid Desc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      // Check only the first argument received by the mock
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          // Use expect.objectContaining for flexibility
          title: 'Valid Title',
          description: 'Valid Desc'
        }),
        expect.anything() // Acknowledge the second argument (event object)
      );
      // Alternatively, you could access the first argument directly:
      // expect(handleSubmit.mock.calls[0][0]).toEqual({
      //   title: 'Valid Title',
      //   description: 'Valid Desc'
      // });
    });
  });

  it('should show validation error if title is empty on submit', async () => {
    const handleSubmit = vi.fn();
    renderBoardForm({ onSubmit: handleSubmit });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    // Wait for the validation message to appear
    const errorMessage = await screen.findByText('Title is required');
    expect(errorMessage).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should render children correctly', () => {
    const handleSubmit = vi.fn();
    render(
      <BoardForm onSubmit={handleSubmit}>
        <div data-testid="child-element">Child Content</div>
      </BoardForm>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
