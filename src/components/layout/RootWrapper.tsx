'use client';

import KBar from '@/components/kbar/Kbar';
import Header from '@/components/layout/Header';
import AppSidebar from '@/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import React from 'react';

export default function RootWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <KBar>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
      <Toaster />
    </>
  );
}
