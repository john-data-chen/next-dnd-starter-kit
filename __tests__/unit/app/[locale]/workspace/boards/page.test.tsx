import BoardsPage from '@/app/[locale]/(workspace)/boards/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/kanban/BoardOverview', () => ({
  BoardOverview: () => <div data-testid="board-overview">BoardOverview</div>
}));

describe('BoardsPage', () => {
  it('should render BoardOverview component', () => {
    render(<BoardsPage />);
    expect(screen.getByTestId('board-overview')).toBeInTheDocument();
  });
});
