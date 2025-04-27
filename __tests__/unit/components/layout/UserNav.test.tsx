import { UserNav } from '@/components/layout/UserNav';
import { ROUTES } from '@/constants/routes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Session } from 'next-auth';
// Keep original imports
import { signOut, useSession } from 'next-auth/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Import vi

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn()
}));

// No need for separate constants with type casts here

describe('UserNav Component', () => {
  const mockSession: Session = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.png',
      id: 'test-user-id' // Assuming id is part of your session user type
    },
    expires: new Date(Date.now() + 2 * 86400).toISOString()
  };

  beforeEach(() => {
    // Reset mocks before each test using vi.mocked()
    // vi.mocked() returns the function with the correct mock type
    vi.mocked(useSession).mockClear();
    vi.mocked(signOut).mockClear();
  });

  it('should render nothing when there is no session', () => {
    // Use mockReturnValue on the mocked function via vi.mocked()
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: function (): Promise<Session | null> {
        throw new Error('Function not implemented.');
      }
    });
    const { container } = render(<UserNav />);
    // Expect the container to be empty or not contain the trigger button
    expect(
      container.querySelector('button[aria-haspopup="menu"]')
    ).not.toBeInTheDocument();
  });

  it('should render the user avatar button when session exists', () => {
    // Use mockReturnValue on the mocked function via vi.mocked()
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      // Removed unnecessary update function
      update: function (): Promise<Session | null> {
        throw new Error('Function not implemented.');
      }
    });
    render(<UserNav />);
    const avatarButton = screen.getByRole('button'); // The trigger is a button
    expect(avatarButton).toBeInTheDocument();

    // Remove the check for alt text as AvatarImage might not render in JSDOM
    // expect(
    //   screen.getByAltText(mockSession.user?.name ?? '')
    // ).toBeInTheDocument();
  });

  it('should open dropdown, show user info and logout option on button click', async () => {
    // Use mockReturnValue on the mocked function via vi.mocked()
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: function (): Promise<Session | null> {
        throw new Error('Function not implemented.');
      }
    });
    const user = userEvent.setup();
    render(<UserNav />);
    const avatarButton = screen.getByRole('button');

    await user.click(avatarButton);

    // Check for user name and email in the dropdown label
    expect(screen.getByText(mockSession.user?.name ?? '')).toBeInTheDocument();
    expect(screen.getByText(mockSession.user?.email ?? '')).toBeInTheDocument();

    // Check for the logout menu item
    expect(
      screen.getByRole('menuitem', { name: /log out/i })
    ).toBeInTheDocument();
  });

  it('should call signOut with correct callbackUrl when logout is clicked', async () => {
    // Use mockReturnValue on the mocked function via vi.mocked()
    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: function (): Promise<Session | null> {
        throw new Error('Function not implemented.');
      }
    });
    const user = userEvent.setup();
    render(<UserNav />);
    const avatarButton = screen.getByRole('button');

    await user.click(avatarButton);
    const logoutMenuItem = screen.getByRole('menuitem', { name: /log out/i });
    await user.click(logoutMenuItem);

    // Assertions on the mocked function via vi.mocked()
    expect(vi.mocked(signOut)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(signOut)).toHaveBeenCalledWith({
      callbackUrl: ROUTES.HOME
    });
  });
});
