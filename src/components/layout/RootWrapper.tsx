'use client';

import AppSidebar from '@/components/layout/AppSidebar';
import Header from '@/components/layout/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';

export default function RootWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
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
