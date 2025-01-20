'use client';

import { Toaster } from '@/components/ui/sonner';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
