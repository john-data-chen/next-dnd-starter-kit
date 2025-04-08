import RootWrapper from '@/components/layout/RootWrapper';
import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return <RootWrapper>{children}</RootWrapper>;
}
