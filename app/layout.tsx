import { auth } from '@/utils/auth';
import Providers from '@/components/layout/providers';
import RootWrapper from '@/components/layout/root-wrapper';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import '@/styles/globals.css';

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900']
});

export const metadata = {
  title: 'Next.js Template',
  description: 'Next.js Template with Kanban Board'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lato.className + ' overflow-hidden'}>
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>
          <RootWrapper>{children}</RootWrapper>
        </Providers>
      </body>
    </html>
  );
}
