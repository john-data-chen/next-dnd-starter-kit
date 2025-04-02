import Providers from '@/components/layout/Providers';
import { auth } from '@/lib/auth';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900']
});

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
        <Providers session={session}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
