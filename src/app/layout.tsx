import Providers from '@/components/layout/Providers';
import { auth } from '@/lib/auth';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import NextTopLoader from 'nextjs-toploader';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-lato overflow-hidden">
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
