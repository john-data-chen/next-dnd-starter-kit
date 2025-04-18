import Providers from '@/components/layout/Providers';
import { projectMetaData } from '@/constants/pageMetaData';
import { auth } from '@/lib/auth';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: projectMetaData.title
  },
  description: projectMetaData.description
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
