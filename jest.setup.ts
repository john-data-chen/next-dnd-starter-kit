import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/'
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => ''
}));

global.fetch = jest.fn();
