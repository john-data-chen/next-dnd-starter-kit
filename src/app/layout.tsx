import Providers from '@/components/layout/Providers';
import { projectName } from '@/constants/projectInfo';
import { auth } from '@/lib/auth';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: projectName
  },
  description: 'A Next.js DnD Kit starter template'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-hidden">
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
