import useThemeSwitching from '@/hooks/useThemeSwitching';
import { act, renderHook } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { describe, expect, it, vi } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn()
}));

describe('useThemeSwitching Hook', () => {
  it('should initialize with theme from useTheme', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      themes: []
    });

    const { result } = renderHook(() => useThemeSwitching());

    expect(result.current.theme).toBe('light');
    expect(result.current.themeAction).toHaveLength(3);
  });

  it('should toggle theme correctly', () => {
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme,
      themes: []
    });

    const { result } = renderHook(() => useThemeSwitching());

    act(() => {
      const toggleAction = result.current.themeAction.find(
        (action) => action.id === 'toggleTheme'
      );
      toggleAction?.perform();
    });

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should set light theme', () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme,
      themes: []
    });

    const { result } = renderHook(() => useThemeSwitching());

    act(() => {
      const setLightAction = result.current.themeAction.find(
        (action) => action.id === 'setLightTheme'
      );
      setLightAction?.perform();
    });

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('should set dark theme', () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme,
      themes: []
    });

    const { result } = renderHook(() => useThemeSwitching());

    act(() => {
      const setDarkAction = result.current.themeAction.find(
        (action) => action.id === 'setDarkTheme'
      );
      setDarkAction?.perform();
    });

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should return correct theme actions structure', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      themes: []
    });

    const { result } = renderHook(() => useThemeSwitching());

    expect(result.current.themeAction).toEqual([
      {
        id: 'toggleTheme',
        name: 'Toggle Theme',
        section: 'Theme',
        perform: expect.any(Function)
      },
      {
        id: 'setLightTheme',
        name: 'Set Light Theme',
        section: 'Theme',
        perform: expect.any(Function)
      },
      {
        id: 'setDarkTheme',
        name: 'Set Dark Theme',
        section: 'Theme',
        perform: expect.any(Function)
      }
    ]);
  });
});
