import NewProjectDialog from '@/components/boards/NewProjectDialog';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

describe('NewProjectDialog', () => {
  it('renders the add project button', () => {
    render(<NewProjectDialog />);

    const button = screen.getByTestId('new-project-trigger');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('＋ Add New Project');
  });

  it('opens dialog when clicking the add button', () => {
    render(<NewProjectDialog />);

    const button = screen.getByTestId('new-project-trigger');
    fireEvent.click(button);

    expect(screen.getByTestId('new-project-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('project-title-input')).toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    render(<NewProjectDialog />);

    fireEvent.click(screen.getByTestId('new-project-trigger'));
    const submitButton = screen.getByTestId('submit-project-button');

    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has value', () => {
    render(<NewProjectDialog />);

    fireEvent.click(screen.getByTestId('new-project-trigger'));
    const input = screen.getByTestId('project-title-input');
    fireEvent.change(input, { target: { value: 'New Project' } });
    const submitButton = screen.getByTestId('submit-project-button');

    expect(submitButton).not.toBeDisabled();
  });

  it('calls onProjectAdd when form is submitted', () => {
    const onProjectAdd = jest.fn();
    render(<NewProjectDialog onProjectAdd={onProjectAdd} />);

    fireEvent.click(screen.getByTestId('new-project-trigger'));
    const input = screen.getByTestId('project-title-input');
    fireEvent.change(input, { target: { value: 'New Project' } });

    const form = screen.getByTestId('new-project-form');
    fireEvent.submit(form);

    expect(onProjectAdd).toHaveBeenCalledWith('New Project');
  });
});
