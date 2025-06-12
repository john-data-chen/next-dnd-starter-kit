import RootWrapper from '@/components/layout/RootWrapper';
import { ROUTES } from '@/constants/routes';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function AppLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { children, params } = props;
  const { locale } = await params;

  const session = await auth();
  const t = await getTranslations({ locale, namespace: 'sidebar' });

  if (!session) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <RootWrapper>{children}</RootWrapper>
    </Suspense>
  );
}
