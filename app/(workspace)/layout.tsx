import RootWrapper from '@/components/layout/root-wrapper';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RootWrapper>{children}</RootWrapper>;
}
