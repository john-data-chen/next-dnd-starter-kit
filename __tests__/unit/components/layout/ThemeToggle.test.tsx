import ThemeToggle from '@/components/layout/ThemeToggle';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock the useTheme hook
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme
    // We don't need to provide 'theme' or other properties for this test
  })
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockSetTheme.mockClear();
  });

  it('should render the toggle button', () => {
    render(<ThemeToggle />);
    // Find the button by its accessible name (provided by the sr-only span)
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should open the dropdown menu on button click and show theme options', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });

    await user.click(toggleButton);

    // Check if menu items are visible after click
    expect(
      screen.getByRole('menuitem', { name: /light/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /system/i })
    ).toBeInTheDocument();
  });

  it('should call setTheme with "light" when Light menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });

    await user.click(toggleButton);
    const lightMenuItem = screen.getByRole('menuitem', { name: /light/i });
    await user.click(lightMenuItem);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with "dark" when Dark menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });

    await user.click(toggleButton);
    const darkMenuItem = screen.getByRole('menuitem', { name: /dark/i });
    await user.click(darkMenuItem);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "system" when System menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });

    await user.click(toggleButton);
    const systemMenuItem = screen.getByRole('menuitem', { name: /system/i });
    await user.click(systemMenuItem);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
