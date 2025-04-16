'use client';

import { Toaster } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster
        position={useIsMobile() ? 'top-right' : 'bottom-right'}
        expand={false}
        closeButton
        visibleToasts={1}
        mobileOffset={useIsMobile() ? { top: '25%' } : { bottom: '16px' }}
      />
    </>
  );
}
