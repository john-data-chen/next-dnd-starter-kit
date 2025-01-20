import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageContainer from '@/components/layout/PageContainer';

describe('PageContainer', () => {
  it('renders the container and content area', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    );

    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('content-area')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders content with correct padding classes', () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    );

    const contentArea = screen.getByTestId('content-area');
    expect(contentArea).toHaveClass('h-full', 'p-4', 'md:px-6');
  });

  it('renders content directly when scrollable is false', () => {
    render(
      <PageContainer scrollable={false}>
        <div>Test Content</div>
      </PageContainer>
    );

    const contentArea = screen.getByTestId('content-area');
    expect(contentArea).toHaveClass('h-full', 'p-4', 'md:px-6');
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
