import SignInView from '@/components/auth/SignInView';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale }
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'login' });

  return {
    title: t('title'),
    description: t('description')
  };
}

export default function LoginPage() {
  return <SignInView />;
}
