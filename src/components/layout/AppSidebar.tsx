'use client';

import { Icons } from '@/components/layout/Icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { companyInfo } from '@/constants/sidebar';
import { useBoards } from '@/hooks/useBoards';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
  const pathname = usePathname();
  const { boards, loading } = useBoards();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="text-sidebar-accent-foreground flex gap-2 py-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Icons.companyLogo />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{companyInfo.name}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Boards</SidebarGroupLabel>
          <SidebarMenu>
            {loading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              boards?.map((board) => (
                <SidebarMenuItem key={board._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/boards/${board._id}`}
                  >
                    <Link href={`/boards/${board._id}`}>
                      <span>{board.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
