'use client';

import KBar from '@/components/kbar/Kbar';
import Header from '@/components/layout/header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

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
