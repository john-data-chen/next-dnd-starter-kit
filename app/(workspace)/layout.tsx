import RootWrapper from '@/components/layout/RootWrapper';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RootWrapper>{children}</RootWrapper>;
}
