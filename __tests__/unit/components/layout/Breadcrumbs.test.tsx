import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock useBreadcrumbs hook
vi.mock('@/hooks/useBreadcrumbs', () => ({
  useBreadcrumbs: vi.fn()
}));

describe('Breadcrumbs Component', () => {
  it('should render single breadcrumb item correctly', () => {
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [{ title: 'Home', link: '/boards' }],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/boards');
  });

  it('should render multiple breadcrumb items correctly for desktop', () => {
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: 'Home', link: '/boards' },
        { title: 'Boards', link: '/boards' },
        { title: 'Project', link: '/boards/1' }
      ],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    const desktopContainer = screen
      .getByRole('list')
      .querySelector('.hidden.md\\:flex');
    expect(desktopContainer).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(5);
    expect(links[2]).toHaveTextContent('Home');
    expect(links[3]).toHaveAttribute('href', '/boards');
    expect(links[3]).toHaveTextContent('Boards');
  });

  it('should render mobile view correctly for multiple items', () => {
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: 'Home', link: '/boards' },
        { title: 'Boards', link: '/boards' },
        { title: 'Project', link: '/boards/1' }
      ],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    // Verify mobile items
    const mobileItems = screen
      .getAllByRole('listitem')
      .filter((item) => item.className.includes('md:hidden'));
    expect(mobileItems).toHaveLength(2);

    // Verify home icon link
    const homeLink = screen.getByRole('link', { name: 'Overview' });
    expect(homeLink).toHaveAttribute('href', '/boards');

    // Verify last item in mobile view - using container query to be specific
    const mobileProjectLink = mobileItems[1].querySelector('a');
    expect(mobileProjectLink).toHaveAttribute('href', '/boards/1');
    expect(mobileProjectLink).toHaveTextContent('Project');
  });

  it('should handle separator rendering correctly', () => {
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: 'Home', link: '/boards' },
        { title: 'Boards', link: '/boards' }
      ],
      rootLink: '/boards'
    });

    render(<Breadcrumbs />);

    const separators = document.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThan(0);
  });
});
