import RootWrapper from '@/components/layout/RootWrapper';
import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  );
}
